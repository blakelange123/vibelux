'use client';

import React, { useState } from 'react';
import { 
  Building, Grid3x3, Layers, Zap, Calculator, 
  Target, Thermometer, Wind, Droplets, Sun,
  ChevronRight, Play, Settings, CheckCircle,
  AlertCircle, Clock, ArrowRight, Lightbulb,
  Leaf, BarChart3, Eye
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'active' | 'completed' | 'error';
  action?: () => void;
  estimatedTime?: string;
}

interface DesignWorkflow {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'greenhouse' | 'vertical' | 'indoor' | 'research';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  steps: WorkflowStep[];
}

export function SpecializedDesignWorkflows() {
  const { state, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const workflows: DesignWorkflow[] = [
    {
      id: 'greenhouse-design',
      name: 'Greenhouse Supplemental Lighting',
      description: 'Design supplemental LED lighting for greenhouse cultivation with natural light integration',
      icon: Building,
      category: 'greenhouse',
      difficulty: 'intermediate',
      estimatedTime: '15-20 minutes',
      steps: [
        {
          id: 'room-setup',
          title: 'Define Greenhouse Dimensions',
          description: 'Set greenhouse dimensions and orientation for solar analysis',
          icon: Building,
          status: 'pending',
          estimatedTime: '2 min',
          action: () => {
            // Auto-create greenhouse room template
            dispatch({ 
              type: 'SET_ROOM', 
              payload: { width: 100, length: 200, height: 12, type: 'greenhouse' }
            });
            showNotification('success', 'Greenhouse template created');
          }
        },
        {
          id: 'solar-analysis',
          title: 'Solar Light Analysis',
          description: 'Calculate natural light availability and seasonal variations',
          icon: Sun,
          status: 'pending',
          estimatedTime: '3 min'
        },
        {
          id: 'crop-requirements',
          title: 'Set Crop Requirements',
          description: 'Define DLI targets and photoperiod requirements',
          icon: Leaf,
          status: 'pending',
          estimatedTime: '2 min'
        },
        {
          id: 'fixture-selection',
          title: 'Select LED Fixtures',
          description: 'Choose efficient fixtures suitable for greenhouse mounting',
          icon: Lightbulb,
          status: 'pending',
          estimatedTime: '5 min'
        },
        {
          id: 'layout-optimization',
          title: 'Optimize Layout',
          description: 'Position fixtures for uniform supplemental lighting',
          icon: Grid3x3,
          status: 'pending',
          estimatedTime: '4 min'
        },
        {
          id: 'control-strategy',
          title: 'Configure Light Controls',
          description: 'Set up daylight harvesting and automated control',
          icon: Settings,
          status: 'pending',
          estimatedTime: '3 min'
        }
      ]
    },
    {
      id: 'vertical-farm',
      name: 'Vertical Farm Design',
      description: 'Complete lighting design for multi-tier vertical growing systems',
      icon: Layers,
      category: 'vertical',
      difficulty: 'advanced',
      estimatedTime: '25-30 minutes',
      steps: [
        {
          id: 'facility-layout',
          title: 'Design Facility Layout',
          description: 'Create multi-tier rack structure with optimal spacing',
          icon: Layers,
          status: 'pending',
          estimatedTime: '4 min'
        },
        {
          id: 'tier-analysis',
          title: 'Analyze Tier Requirements',
          description: 'Calculate different PPFD needs per growing tier',
          icon: BarChart3,
          status: 'pending',
          estimatedTime: '3 min'
        },
        {
          id: 'fixture-mounting',
          title: 'Fixture Mounting Strategy',
          description: 'Design inter-lighting and top-lighting solutions',
          icon: Lightbulb,
          status: 'pending',
          estimatedTime: '6 min'
        },
        {
          id: 'thermal-management',
          title: 'Thermal Management',
          description: 'Analyze heat load and cooling requirements',
          icon: Thermometer,
          status: 'pending',
          estimatedTime: '4 min'
        },
        {
          id: 'air-circulation',
          title: 'Air Circulation Design',
          description: 'Integrate HVAC and air movement systems',
          icon: Wind,
          status: 'pending',
          estimatedTime: '3 min'
        },
        {
          id: 'zone-control',
          title: 'Multi-Zone Control',
          description: 'Set up independent control for each growing zone',
          icon: Target,
          status: 'pending',
          estimatedTime: '5 min'
        }
      ]
    },
    {
      id: 'indoor-room',
      name: 'Indoor Growing Room',
      description: 'Sealed environment design for maximum crop control',
      icon: Grid3x3,
      category: 'indoor',
      difficulty: 'beginner',
      estimatedTime: '10-15 minutes',
      steps: [
        {
          id: 'room-sealed',
          title: 'Sealed Room Setup',
          description: 'Define contained growing environment dimensions',
          icon: Building,
          status: 'pending',
          estimatedTime: '2 min'
        },
        {
          id: 'ppfd-targets',
          title: 'PPFD Target Analysis',
          description: 'Set optimal light levels for crop growth stage',
          icon: Target,
          status: 'pending',
          estimatedTime: '2 min'
        },
        {
          id: 'fixture-array',
          title: 'Create Fixture Array',
          description: 'Use array tool for uniform light distribution',
          icon: Grid3x3,
          status: 'pending',
          estimatedTime: '3 min'
        },
        {
          id: 'uniformity-check',
          title: 'Check Light Uniformity',
          description: 'Verify min/max PPFD ratios meet requirements',
          icon: BarChart3,
          status: 'pending',
          estimatedTime: '2 min'
        },
        {
          id: 'environmental-integration',
          title: 'Environmental Controls',
          description: 'Integrate lighting with climate control systems',
          icon: Thermometer,
          status: 'pending',
          estimatedTime: '3 min'
        }
      ]
    },
    {
      id: 'research-facility',
      name: 'Research Facility',
      description: 'Precision lighting for controlled research environments',
      icon: Calculator,
      category: 'research',
      difficulty: 'advanced',
      estimatedTime: '20-25 minutes',
      steps: [
        {
          id: 'research-parameters',
          title: 'Define Research Parameters',
          description: 'Set precise experimental lighting conditions',
          icon: Calculator,
          status: 'pending',
          estimatedTime: '4 min'
        },
        {
          id: 'spectral-control',
          title: 'Spectral Control Design',
          description: 'Configure multiple spectrum channels for research',
          icon: Eye,
          status: 'pending',
          estimatedTime: '5 min'
        },
        {
          id: 'treatment-zones',
          title: 'Treatment Zone Layout',
          description: 'Create isolated zones for different treatments',
          icon: Target,
          status: 'pending',
          estimatedTime: '4 min'
        },
        {
          id: 'measurement-grid',
          title: 'Measurement Grid Setup',
          description: 'Design high-resolution measurement points',
          icon: Grid3x3,
          status: 'pending',
          estimatedTime: '3 min'
        },
        {
          id: 'control-precision',
          title: 'Precision Control Systems',
          description: 'Configure accurate dimming and timing controls',
          icon: Settings,
          status: 'pending',
          estimatedTime: '4 min'
        },
        {
          id: 'data-logging',
          title: 'Data Logging Setup',
          description: 'Configure sensors and data collection systems',
          icon: BarChart3,
          status: 'pending',
          estimatedTime: '3 min'
        }
      ]
    }
  ];

  const executeStep = (workflow: DesignWorkflow, stepIndex: number) => {
    const step = workflow.steps[stepIndex];
    if (step.action) {
      step.action();
    }
    
    // Update step status
    workflow.steps[stepIndex].status = 'completed';
    
    // Move to next step
    if (stepIndex < workflow.steps.length - 1) {
      workflow.steps[stepIndex + 1].status = 'active';
      setCurrentStep(stepIndex + 1);
    } else {
      showNotification('success', `${workflow.name} workflow completed!`);
      setActiveWorkflow(null);
      setCurrentStep(0);
    }
  };

  const startWorkflow = (workflowId: string) => {
    setActiveWorkflow(workflowId);
    setCurrentStep(0);
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      workflow.steps.forEach((step, index) => {
        step.status = index === 0 ? 'active' : 'pending';
      });
      showNotification('info', `Started ${workflow.name} workflow`);
    }
  };

  const getWorkflowByCategory = (category: string) => {
    return workflows.filter(w => w.category === category);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'intermediate': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'advanced': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'active': return <Play className="w-4 h-4 text-blue-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (activeWorkflow) {
    const workflow = workflows.find(w => w.id === activeWorkflow);
    if (!workflow) return null;

    return (
      <div className="h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Workflow Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{workflow.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{workflow.description}</p>
            </div>
            <button
              onClick={() => setActiveWorkflow(null)}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Exit Workflow
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Step {currentStep + 1} of {workflow.steps.length}</span>
              <span>{workflow.estimatedTime}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / workflow.steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Step */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {workflow.steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCurrentStep = index === currentStep;
              const isCompleted = step.status === 'completed';
              const isPending = step.status === 'pending';

              return (
                <div
                  key={step.id}
                  className={`
                    p-4 rounded-xl border transition-all
                    ${isCurrentStep 
                      ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                      : isCompleted
                      ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${isCurrentStep 
                        ? 'bg-blue-100 dark:bg-blue-900/30' 
                        : isCompleted
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <StepIcon className={`w-5 h-5 ${
                          isCurrentStep 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${
                          isCurrentStep 
                            ? 'text-blue-900 dark:text-blue-100' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {step.title}
                        </h3>
                        {step.estimatedTime && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {step.estimatedTime}
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-sm mt-1 ${
                        isCurrentStep 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                      
                      {isCurrentStep && (
                        <button
                          onClick={() => executeStep(workflow, index)}
                          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          Execute Step
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Design Workflows</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Guided workflows for professional lighting design</p>
      </div>

      {/* Workflow Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {[
          { key: 'greenhouse', title: 'Greenhouse', icon: Building },
          { key: 'vertical', title: 'Vertical Farming', icon: Layers },
          { key: 'indoor', title: 'Indoor Growing', icon: Grid3x3 },
          { key: 'research', title: 'Research Facilities', icon: Calculator }
        ].map(category => {
          const CategoryIcon = category.icon;
          const categoryWorkflows = getWorkflowByCategory(category.key);
          
          return (
            <div key={category.key}>
              <div className="flex items-center gap-2 mb-3">
                <CategoryIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{category.title}</h3>
              </div>
              
              <div className="space-y-3">
                {categoryWorkflows.map(workflow => {
                  const WorkflowIcon = workflow.icon;
                  return (
                    <div
                      key={workflow.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer group"
                      onClick={() => startWorkflow(workflow.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                          <WorkflowIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-100">
                              {workflow.name}
                            </h4>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {workflow.description}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${getDifficultyColor(workflow.difficulty)}`}>
                              {workflow.difficulty}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {workflow.estimatedTime}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {workflow.steps.length} steps
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}