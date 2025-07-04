'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FlaskConical, Grid3x3, BarChart3, Download, Plus, Save,
  Shuffle, FileSpreadsheet, TrendingUp, Calendar, Settings,
  Clipboard, CheckCircle, AlertTriangle, Info, X, Eye,
  Database, Filter, Microscope, TestTube, Beaker, Activity
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';

interface ExperimentDesign {
  id: string;
  name: string;
  type: 'factorial' | 'randomized_block' | 'split_plot' | 'latin_square';
  factors: Factor[];
  replications: number;
  blockingFactor?: string;
  layout: ExperimentalUnit[][];
  startDate: string;
  duration: number; // days
  status: 'planning' | 'active' | 'completed';
  measurements: Measurement[];
}

interface Factor {
  id: string;
  name: string;
  type: 'continuous' | 'categorical';
  levels: FactorLevel[];
}

interface FactorLevel {
  id: string;
  value: string | number;
  description?: string;
}

interface ExperimentalUnit {
  id: string;
  position: { x: number; y: number; section?: string };
  treatments: { [factorId: string]: string | number };
  blockId?: string;
  measurements: { [measurementId: string]: MeasurementData[] };
}

interface Measurement {
  id: string;
  name: string;
  unit: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'endpoint';
  method?: string;
}

interface MeasurementData {
  date: string;
  value: number;
  notes?: string;
}

interface PropagationProtocol {
  id: string;
  name: string;
  species: string;
  method: 'cutting' | 'seed' | 'tissue_culture' | 'division';
  steps: PropagationStep[];
  environmentalRequirements: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    lightIntensity: number;
    photoperiod: number;
  };
  expectedDuration: number; // days
  successRate: number; // percentage
}

interface PropagationStep {
  id: string;
  day: number;
  action: string;
  details: string;
  criticalPoints?: string[];
}

interface PropagationBatch {
  id: string;
  protocolId: string;
  startDate: string;
  quantity: number;
  sourceId?: string;
  location: string;
  status: 'active' | 'completed' | 'failed';
  successCount?: number;
  notes: string[];
  currentStep: number;
}

const EXPERIMENT_TEMPLATES: Partial<ExperimentDesign>[] = [
  {
    name: 'Light Intensity Study',
    type: 'randomized_block',
    factors: [{
      id: 'light',
      name: 'Light Intensity',
      type: 'continuous',
      levels: [
        { id: '1', value: 200, description: '200 µmol/m²/s' },
        { id: '2', value: 400, description: '400 µmol/m²/s' },
        { id: '3', value: 600, description: '600 µmol/m²/s' }
      ]
    }],
    replications: 4,
    measurements: [
      { id: 'height', name: 'Plant Height', unit: 'cm', frequency: 'weekly' },
      { id: 'biomass', name: 'Fresh Weight', unit: 'g', frequency: 'endpoint' }
    ]
  },
  {
    name: 'Nutrient x Light Factorial',
    type: 'factorial',
    factors: [
      {
        id: 'light',
        name: 'Light Level',
        type: 'categorical',
        levels: [
          { id: 'low', value: 'Low', description: '250 µmol/m²/s' },
          { id: 'high', value: 'High', description: '500 µmol/m²/s' }
        ]
      },
      {
        id: 'nutrient',
        name: 'Nutrient Concentration',
        type: 'categorical',
        levels: [
          { id: 'low', value: 'Low', description: '1.0 EC' },
          { id: 'med', value: 'Medium', description: '1.5 EC' },
          { id: 'high', value: 'High', description: '2.0 EC' }
        ]
      }
    ],
    replications: 3
  }
];

const PROPAGATION_PROTOCOLS: PropagationProtocol[] = [
  {
    id: 'basil-cutting',
    name: 'Basil Stem Cutting',
    species: 'Ocimum basilicum',
    method: 'cutting',
    steps: [
      {
        id: '1',
        day: 0,
        action: 'Take Cuttings',
        details: 'Cut 4-6 inch stems below node, remove lower leaves',
        criticalPoints: ['Use sterile tools', 'Cut at 45° angle']
      },
      {
        id: '2',
        day: 0,
        action: 'Rooting Treatment',
        details: 'Dip in rooting hormone (IBA 1000ppm)',
        criticalPoints: ['Tap off excess powder']
      },
      {
        id: '3',
        day: 0,
        action: 'Plant in Media',
        details: 'Insert into pre-moistened rockwool or perlite',
        criticalPoints: ['Maintain high humidity (90%+)']
      },
      {
        id: '4',
        day: 7,
        action: 'Check Root Development',
        details: 'Look for white root tips emerging',
        criticalPoints: ['Do not disturb cuttings unnecessarily']
      },
      {
        id: '5',
        day: 14,
        action: 'Transplant',
        details: 'Move rooted cuttings to growing media',
        criticalPoints: ['Handle gently to avoid root damage']
      }
    ],
    environmentalRequirements: {
      temperature: { min: 20, max: 25 },
      humidity: { min: 85, max: 95 },
      lightIntensity: 100,
      photoperiod: 16
    },
    expectedDuration: 14,
    successRate: 95
  }
];

interface ResearchPropagationToolsProps {
  onClose?: () => void;
}

export function ResearchPropagationTools({ onClose }: ResearchPropagationToolsProps) {
  const { state } = useDesigner();
  const [activeTab, setActiveTab] = useState<'experiments' | 'propagation'>('experiments');
  const [experiments, setExperiments] = useState<ExperimentDesign[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [propagationBatches, setPropagationBatches] = useState<PropagationBatch[]>([]);
  const [showNewExperiment, setShowNewExperiment] = useState(false);
  const [showDataEntry, setShowDataEntry] = useState(false);

  // Generate randomized layout
  const generateRandomizedLayout = (
    design: Partial<ExperimentDesign>,
    roomWidth: number,
    roomLength: number
  ): ExperimentalUnit[][] => {
    if (!design.factors || !design.replications) return [];
    
    // Calculate total units needed
    let totalUnits = design.replications;
    design.factors.forEach(factor => {
      totalUnits *= factor.levels.length;
    });
    
    // Create treatment combinations
    const treatments: { [factorId: string]: string | number }[] = [];
    const generateCombinations = (factorIndex: number, current: any) => {
      if (factorIndex === design.factors!.length) {
        for (let rep = 0; rep < design.replications!; rep++) {
          treatments.push({ ...current });
        }
        return;
      }
      
      const factor = design.factors![factorIndex];
      factor.levels.forEach(level => {
        generateCombinations(factorIndex + 1, {
          ...current,
          [factor.id]: level.value
        });
      });
    };
    
    generateCombinations(0, {});
    
    // Shuffle treatments
    for (let i = treatments.length - 1; i > 0; i--) {
      const j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * (i + 1));
      [treatments[i], treatments[j]] = [treatments[j], treatments[i]];
    }
    
    // Create grid layout
    const cols = Math.ceil(Math.sqrt(totalUnits));
    const rows = Math.ceil(totalUnits / cols);
    const layout: ExperimentalUnit[][] = [];
    
    let unitIndex = 0;
    for (let row = 0; row < rows; row++) {
      const rowUnits: ExperimentalUnit[] = [];
      for (let col = 0; col < cols; col++) {
        if (unitIndex < treatments.length) {
          rowUnits.push({
            id: `unit-${unitIndex}`,
            position: { x: col, y: row },
            treatments: treatments[unitIndex],
            measurements: {}
          });
          unitIndex++;
        }
      }
      layout.push(rowUnits);
    }
    
    return layout;
  };

  // Create new experiment
  const createExperiment = (template: Partial<ExperimentDesign>) => {
    const newExperiment: ExperimentDesign = {
      id: `exp-${Date.now()}`,
      name: template.name || 'New Experiment',
      type: template.type || 'randomized_block',
      factors: template.factors || [],
      replications: template.replications || 3,
      layout: generateRandomizedLayout(template, state.room.width, state.room.length),
      startDate: new Date().toISOString().split('T')[0],
      duration: 30,
      status: 'planning',
      measurements: template.measurements || []
    };
    
    setExperiments([...experiments, newExperiment]);
    setSelectedExperiment(newExperiment.id);
    setShowNewExperiment(false);
  };

  // Export experiment data
  const exportExperimentData = (experimentId: string) => {
    const experiment = experiments.find(e => e.id === experimentId);
    if (!experiment) return;
    
    // Create CSV format
    const headers = ['Unit_ID', 'Position_X', 'Position_Y'];
    experiment.factors.forEach(factor => headers.push(factor.name));
    experiment.measurements.forEach(m => headers.push(m.name));
    
    const rows: string[][] = [];
    experiment.layout.flat().forEach(unit => {
      const row = [
        unit.id,
        unit.position.x.toString(),
        unit.position.y.toString()
      ];
      
      experiment.factors.forEach(factor => {
        row.push(unit.treatments[factor.id]?.toString() || '');
      });
      
      experiment.measurements.forEach(measurement => {
        const data = unit.measurements[measurement.id];
        if (data && data.length > 0) {
          row.push(data[data.length - 1].value.toString());
        } else {
          row.push('');
        }
      });
      
      rows.push(row);
    });
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${experiment.name.replace(/\s+/g, '_')}_data.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate experiment statistics
  const calculateStatistics = (experiment: ExperimentDesign) => {
    const stats: any = {
      totalUnits: experiment.layout.flat().length,
      completedMeasurements: 0,
      pendingMeasurements: 0
    };
    
    experiment.layout.flat().forEach(unit => {
      experiment.measurements.forEach(measurement => {
        if (unit.measurements[measurement.id]?.length > 0) {
          stats.completedMeasurements++;
        } else {
          stats.pendingMeasurements++;
        }
      });
    });
    
    return stats;
  };

  // Start propagation batch
  const startPropagationBatch = (protocolId: string, quantity: number) => {
    const protocol = PROPAGATION_PROTOCOLS.find(p => p.id === protocolId);
    if (!protocol) return;
    
    const newBatch: PropagationBatch = {
      id: `batch-${Date.now()}`,
      protocolId,
      startDate: new Date().toISOString(),
      quantity,
      location: 'Propagation Area 1',
      status: 'active',
      notes: [],
      currentStep: 0
    };
    
    setPropagationBatches([...propagationBatches, newBatch]);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <FlaskConical className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Research & Propagation Tools</h2>
            <p className="text-sm text-gray-400">Design experiments and manage propagation protocols</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('experiments')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'experiments'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Microscope className="w-4 h-4" />
            Experimental Design
          </div>
        </button>
        <button
          onClick={() => setActiveTab('propagation')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'propagation'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Propagation Protocols
          </div>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'experiments' ? (
        <div className="space-y-6">
          {/* Experiment Controls */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowNewExperiment(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Experiment
            </button>
            {selectedExperiment && (
              <>
                <button
                  onClick={() => setShowDataEntry(true)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Clipboard className="w-4 h-4" />
                  Enter Data
                </button>
                <button
                  onClick={() => exportExperimentData(selectedExperiment)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </>
            )}
          </div>

          {/* Active Experiments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Active Experiments</h3>
              <div className="space-y-2">
                {experiments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Beaker className="w-12 h-12 mx-auto mb-3" />
                    <p>No experiments yet. Create one to get started!</p>
                  </div>
                ) : (
                  experiments.map(exp => {
                    const stats = calculateStatistics(exp);
                    return (
                      <div
                        key={exp.id}
                        onClick={() => setSelectedExperiment(exp.id)}
                        className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedExperiment === exp.id ? 'ring-2 ring-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{exp.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            exp.status === 'active' ? 'bg-green-600 text-white' :
                            exp.status === 'completed' ? 'bg-gray-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {exp.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <span className="text-white ml-1">{exp.type.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Units:</span>
                            <span className="text-white ml-1">{stats.totalUnits}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Factors:</span>
                            <span className="text-white ml-1">{exp.factors.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Progress:</span>
                            <span className="text-white ml-1">
                              {Math.round((stats.completedMeasurements / 
                                (stats.completedMeasurements + stats.pendingMeasurements)) * 100) || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Experiment Details */}
            {selectedExperiment && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Experiment Layout</h3>
                {(() => {
                  const experiment = experiments.find(e => e.id === selectedExperiment);
                  if (!experiment) return null;
                  
                  return (
                    <div className="bg-gray-800 rounded-lg p-4">
                      {/* Factor Legend */}
                      <div className="mb-4 space-y-2">
                        {experiment.factors.map(factor => (
                          <div key={factor.id} className="text-sm">
                            <span className="text-gray-400">{factor.name}:</span>
                            <div className="flex gap-2 mt-1">
                              {factor.levels.map(level => (
                                <span key={level.id} className="px-2 py-1 bg-gray-700 rounded text-xs text-white">
                                  {level.value}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Grid Layout */}
                      <div className="overflow-auto">
                        <div className="inline-block min-w-full">
                          {experiment.layout.map((row, rowIdx) => (
                            <div key={rowIdx} className="flex gap-1 mb-1">
                              {row.map(unit => (
                                <div
                                  key={unit.id}
                                  className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center text-xs text-white hover:bg-gray-600 cursor-pointer relative group"
                                  title={Object.entries(unit.treatments)
                                    .map(([factorId, value]) => {
                                      const factor = experiment.factors.find(f => f.id === factorId);
                                      return `${factor?.name}: ${value}`;
                                    })
                                    .join('\n')
                                  }
                                >
                                  <div className="text-center">
                                    <div className="font-mono text-[10px]">
                                      {unit.id.split('-')[1]}
                                    </div>
                                    {Object.keys(unit.measurements).length > 0 && (
                                      <CheckCircle className="w-3 h-3 text-green-400 mt-1" />
                                    )}
                                  </div>
                                  
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                    {Object.entries(unit.treatments).map(([factorId, value]) => {
                                      const factor = experiment.factors.find(f => f.id === factorId);
                                      return (
                                        <div key={factorId} className="text-xs">
                                          <span className="text-gray-400">{factor?.name}:</span>
                                          <span className="text-white ml-1">{value}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Measurements */}
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Measurements</h4>
                        <div className="space-y-1">
                          {experiment.measurements.map(m => (
                            <div key={m.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">{m.name}</span>
                              <span className="text-gray-500">{m.unit} - {m.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* New Experiment Modal */}
          {showNewExperiment && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Create New Experiment</h3>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-300">Choose a template:</h4>
                  {EXPERIMENT_TEMPLATES.map((template, idx) => (
                    <div
                      key={idx}
                      onClick={() => createExperiment(template)}
                      className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                    >
                      <h5 className="font-medium text-white mb-2">{template.name}</h5>
                      <div className="text-sm text-gray-400">
                        <p>Type: {template.type?.replace('_', ' ')}</p>
                        <p>Factors: {template.factors?.length}</p>
                        <p>Replications: {template.replications}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowNewExperiment(false)}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Propagation Controls */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                const protocol = PROPAGATION_PROTOCOLS[0];
                const quantity = prompt('Enter quantity:', '50');
                if (quantity) {
                  startPropagationBatch(protocol.id, parseInt(quantity));
                }
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Start New Batch
            </button>
          </div>

          {/* Protocols */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Propagation Protocols</h3>
              <div className="space-y-3">
                {PROPAGATION_PROTOCOLS.map(protocol => (
                  <div key={protocol.id} className="bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">{protocol.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Species:</span>
                        <span className="text-white ml-2 italic">{protocol.species}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Method:</span>
                        <span className="text-white ml-2 capitalize">{protocol.method}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white ml-2">{protocol.expectedDuration} days</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Success Rate:</span>
                        <span className="text-green-400 ml-2">{protocol.successRate}%</span>
                      </div>
                      
                      {/* Environmental Requirements */}
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="font-medium text-gray-300 mb-2">Environmental Requirements:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Temp:</span>
                            <span className="text-white ml-1">
                              {protocol.environmentalRequirements.temperature.min}-
                              {protocol.environmentalRequirements.temperature.max}°C
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">RH:</span>
                            <span className="text-white ml-1">
                              {protocol.environmentalRequirements.humidity.min}-
                              {protocol.environmentalRequirements.humidity.max}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Light:</span>
                            <span className="text-white ml-1">
                              {protocol.environmentalRequirements.lightIntensity} µmol
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Photo:</span>
                            <span className="text-white ml-1">
                              {protocol.environmentalRequirements.photoperiod}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Batches */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Active Propagation Batches</h3>
              {propagationBatches.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <TestTube className="w-12 h-12 mx-auto mb-3" />
                  <p>No active propagation batches</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {propagationBatches.map(batch => {
                    const protocol = PROPAGATION_PROTOCOLS.find(p => p.id === batch.protocolId);
                    if (!protocol) return null;
                    
                    const daysSinceStart = Math.floor(
                      (Date.now() - new Date(batch.startDate).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const currentStep = protocol.steps.find(s => s.day <= daysSinceStart);
                    
                    return (
                      <div key={batch.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{protocol.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            batch.status === 'active' ? 'bg-green-600 text-white' :
                            batch.status === 'completed' ? 'bg-gray-600 text-white' :
                            'bg-red-600 text-white'
                          }`}>
                            {batch.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-400">Quantity:</span>
                            <span className="text-white ml-2">{batch.quantity} units</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Day:</span>
                            <span className="text-white ml-2">{daysSinceStart} / {protocol.expectedDuration}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Current Step:</span>
                            <span className="text-white ml-2">{currentStep?.action || 'Monitoring'}</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${(daysSinceStart / protocol.expectedDuration) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}