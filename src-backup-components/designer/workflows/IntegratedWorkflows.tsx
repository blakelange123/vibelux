'use client';

import React, { useState } from 'react';
import { 
  Zap, Target, DollarSign, FileText, Settings, 
  CheckCircle, ArrowRight, Layers, Calculator
} from 'lucide-react';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
  action?: () => void;
  subSteps?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedTime: string;
  steps: WorkflowStep[];
}

export const workflows: Workflow[] = [
  {
    id: 'quick-design',
    name: 'Quick Facility Design',
    description: 'Design a complete grow facility in 5 steps',
    category: 'Design',
    estimatedTime: '15-30 min',
    steps: [
      {
        id: 'room-setup',
        name: 'Room Setup',
        description: 'Define your grow space dimensions',
        icon: <Layers className="w-5 h-5" />,
        status: 'pending',
        subSteps: ['Set dimensions', 'Choose structure type', 'Add obstacles']
      },
      {
        id: 'target-ppfd',
        name: 'Set Targets',
        description: 'Define PPFD and DLI requirements',
        icon: <Target className="w-5 h-5" />,
        status: 'pending',
        subSteps: ['Select crop type', 'Set growth stage', 'Define PPFD target']
      },
      {
        id: 'fixture-selection',
        name: 'Select Fixtures',
        description: 'Choose fixtures from DLC database',
        icon: <Zap className="w-5 h-5" />,
        status: 'pending',
        subSteps: ['Filter by efficacy', 'Upload IES file', 'Compare options']
      },
      {
        id: 'auto-layout',
        name: 'Auto Layout',
        description: 'AI-optimized fixture placement',
        icon: <Settings className="w-5 h-5" />,
        status: 'pending',
        subSteps: ['Run optimization', 'Review uniformity', 'Adjust spacing']
      },
      {
        id: 'verify-export',
        name: 'Verify & Export',
        description: 'Check compliance and generate reports',
        icon: <FileText className="w-5 h-5" />,
        status: 'pending',
        subSteps: ['Check DLC compliance', 'Calculate ROI', 'Export PDF']
      }
    ]
  },
  {
    id: 'energy-optimization',
    name: 'Energy Cost Optimization',
    description: 'Reduce operating costs while maintaining DLI',
    category: 'Optimization',
    estimatedTime: '10-20 min',
    steps: [
      {
        id: 'load-design',
        name: 'Load Design',
        description: 'Import existing facility design',
        icon: <Layers className="w-5 h-5" />,
        status: 'pending'
      },
      {
        id: 'utility-rates',
        name: 'Set Utility Rates',
        description: 'Configure time-of-use rates',
        icon: <DollarSign className="w-5 h-5" />,
        status: 'pending',
        subSteps: ['Peak hours', 'Off-peak rates', 'Demand charges']
      },
      {
        id: 'dli-constraints',
        name: 'DLI Constraints',
        description: 'Set minimum DLI requirements',
        icon: <Target className="w-5 h-5" />,
        status: 'pending'
      },
      {
        id: 'optimize-schedule',
        name: 'Optimize Schedule',
        description: 'Generate cost-optimal lighting schedule',
        icon: <Calculator className="w-5 h-5" />,
        status: 'pending',
        subSteps: ['Peak shaving', 'Load shifting', 'Dimming strategy']
      },
      {
        id: 'savings-report',
        name: 'Savings Report',
        description: 'View projected cost savings',
        icon: <FileText className="w-5 h-5" />,
        status: 'pending'
      }
    ]
  },
  {
    id: 'multi-zone-setup',
    name: 'Multi-Zone Production',
    description: 'Configure staged production with different zones',
    category: 'Advanced',
    estimatedTime: '20-40 min',
    steps: [
      {
        id: 'define-zones',
        name: 'Define Zones',
        description: 'Create production zones',
        icon: <Layers className="w-5 h-5" />,
        status: 'pending',
        subSteps: ['Propagation', 'Vegetative', 'Flowering', 'Finishing']
      },
      {
        id: 'zone-requirements',
        name: 'Zone Requirements',
        description: 'Set targets for each zone',
        icon: <Target className="w-5 h-5" />,
        status: 'pending',
        subSteps: ['PPFD levels', 'Photoperiods', 'Spectrum']
      },
      {
        id: 'fixture-allocation',
        name: 'Fixture Allocation',
        description: 'Assign fixtures to zones',
        icon: <Zap className="w-5 h-5" />,
        status: 'pending'
      },
      {
        id: 'schedule-sync',
        name: 'Schedule Sync',
        description: 'Coordinate zone transitions',
        icon: <Settings className="w-5 h-5" />,
        status: 'pending'
      },
      {
        id: 'production-timeline',
        name: 'Production Timeline',
        description: 'View crop flow visualization',
        icon: <FileText className="w-5 h-5" />,
        status: 'pending'
      }
    ]
  },
  {
    id: 'compliance-check',
    name: 'Compliance & Rebates',
    description: 'Ensure code compliance and maximize rebates',
    category: 'Compliance',
    estimatedTime: '5-15 min',
    steps: [
      {
        id: 'electrical-check',
        name: 'Electrical Compliance',
        description: 'Verify NEC requirements',
        icon: <Zap className="w-5 h-5" />,
        status: 'pending',
        subSteps: ['Circuit loading', 'Wire sizing', 'Voltage drop']
      },
      {
        id: 'dlc-verification',
        name: 'DLC Verification',
        description: 'Check fixture qualifications',
        icon: <CheckCircle className="w-5 h-5" />,
        status: 'pending'
      },
      {
        id: 'rebate-calculator',
        name: 'Rebate Calculator',
        description: 'Calculate utility incentives',
        icon: <DollarSign className="w-5 h-5" />,
        status: 'pending'
      },
      {
        id: 'generate-docs',
        name: 'Generate Documents',
        description: 'Create compliance reports',
        icon: <FileText className="w-5 h-5" />,
        status: 'pending'
      }
    ]
  }
];

interface WorkflowRunnerProps {
  workflow: Workflow;
  onComplete?: (workflowId: string) => void;
}

export function WorkflowRunner({ workflow, onComplete }: WorkflowRunnerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    if (currentStepIndex < workflow.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete?.(workflow.id);
    }
  };

  const currentStep = workflow.steps[currentStepIndex];
  const progress = (completedSteps.size / workflow.steps.length) * 100;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">{workflow.name}</h3>
        <p className="text-gray-400">{workflow.description}</p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {workflow.steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = completedSteps.has(step.id);
          const isPending = index > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all ${
                isActive 
                  ? 'border-purple-600 bg-purple-600/10' 
                  : isCompleted
                  ? 'border-green-600 bg-green-600/10'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? 'bg-purple-600 text-white' 
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.icon}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    isActive || isCompleted ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                  
                  {/* Sub-steps */}
                  {isActive && step.subSteps && (
                    <ul className="mt-3 space-y-1">
                      {step.subSteps.map((subStep, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-500 rounded-full" />
                          {subStep}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {isActive && (
                  <button
                    onClick={() => handleStepComplete(step.id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion */}
      {progress === 100 && (
        <div className="mt-6 p-4 bg-green-600/20 border border-green-600 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <h4 className="text-white font-medium">Workflow Complete!</h4>
              <p className="text-sm text-gray-300 mt-1">
                Your {workflow.name.toLowerCase()} is ready. View results or start a new workflow.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkflowSelector() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  if (selectedWorkflow) {
    return (
      <div>
        <button
          onClick={() => setSelectedWorkflow(null)}
          className="mb-4 text-purple-400 hover:text-purple-300 flex items-center gap-2"
        >
          ← Back to workflows
        </button>
        <WorkflowRunner 
          workflow={selectedWorkflow}
          onComplete={() => {
            // Handle completion
            setTimeout(() => setSelectedWorkflow(null), 2000);
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {workflows.map(workflow => (
        <div
          key={workflow.id}
          className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-purple-600 transition-all cursor-pointer"
          onClick={() => setSelectedWorkflow(workflow)}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-medium text-white">{workflow.name}</h3>
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
              {workflow.estimatedTime}
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">{workflow.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{workflow.steps.length} steps</span>
            <span className="text-xs text-purple-400">{workflow.category}</span>
          </div>
        </div>
      ))}
    </div>
  );
}