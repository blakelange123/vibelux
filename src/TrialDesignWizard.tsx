'use client';

import React, { useState, useEffect } from 'react';
import {
  Beaker,
  Target,
  BarChart3,
  Settings,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Lightbulb,
  Users,
  Calendar,
  Save
} from 'lucide-react';
import {
  Trial,
  TrialTemplate,
  ExperimentalDesign,
  Treatment,
  Measurement,
  Factor,
  StatisticalParameters,
  MICROGREENS_TRIAL_TEMPLATES
} from '@/types/trials';
import { StatisticalUtils } from '@/lib/statistical-analysis';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
}

interface TrialDesignWizardProps {
  onTrialCreate: (trial: Partial<Trial>) => void;
  onClose: () => void;
  existingTrial?: Partial<Trial>;
}

export function TrialDesignWizard({ onTrialCreate, onClose, existingTrial }: TrialDesignWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [trialData, setTrialData] = useState<Partial<Trial>>(existingTrial || {
    name: '',
    description: '',
    hypothesis: '',
    objectives: [],
    experimentalDesign: {
      type: 'COMPLETELY_RANDOMIZED',
      factors: [],
      replicates: 4,
      randomization: { method: 'SIMPLE' },
      controls: []
    },
    treatments: [],
    measurements: [],
    statisticalParams: {
      significanceLevel: 0.05,
      power: 0.8,
      minimumSampleSize: 12,
      primaryAnalysis: 'ANOVA',
      secondaryAnalyses: []
    },
    tags: []
  });
  
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    warnings: string[];
    errors: string[];
  }>({ valid: false, warnings: [], errors: [] });

  // Validate trial design whenever data changes
  useEffect(() => {
    if (trialData.experimentalDesign && trialData.measurements) {
      const result = StatisticalUtils.validateTrialDesign(trialData as Trial);
      setValidationResult(result);
    }
  }, [trialData]);

  const wizardSteps: WizardStep[] = [
    {
      id: 'overview',
      title: 'Trial Overview',
      description: 'Define your trial objectives and hypothesis',
      icon: Target,
      component: TrialOverviewStep
    },
    {
      id: 'template',
      title: 'Select Template',
      description: 'Choose from validated trial templates or start custom',
      icon: BookOpen,
      component: TemplateSelectionStep
    },
    {
      id: 'design',
      title: 'Experimental Design',
      description: 'Configure factors, treatments, and randomization',
      icon: Settings,
      component: ExperimentalDesignStep
    },
    {
      id: 'measurements',
      title: 'Measurements',
      description: 'Define data collection parameters',
      icon: BarChart3,
      component: MeasurementsStep
    },
    {
      id: 'statistics',
      title: 'Statistical Analysis',
      description: 'Configure statistical parameters and power analysis',
      icon: Beaker,
      component: StatisticsStep
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review your trial design and submit',
      icon: CheckCircle,
      component: ReviewStep
    }
  ];

  const currentStepData = wizardSteps[currentStep];
  const StepComponent = currentStepData.component;

  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTrialUpdate = (updates: Partial<Trial>) => {
    setTrialData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = () => {
    if (validationResult.valid) {
      onTrialCreate(trialData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Beaker className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Trial Design Wizard</h1>
                <p className="text-blue-100">Create scientifically rigorous experiments</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            {wizardSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${
                  index <= currentStep ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < currentStep ? 'bg-green-500' :
                  index === currentStep ? 'bg-blue-500' : 'bg-gray-600'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <step.icon className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / wizardSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">{currentStepData.title}</h2>
            <p className="text-gray-400">{currentStepData.description}</p>
          </div>

          <StepComponent
            trialData={trialData}
            onUpdate={handleTrialUpdate}
            validationResult={validationResult}
          />
        </div>

        {/* Navigation */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {validationResult.warnings.length > 0 && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {validationResult.warnings.length} warning(s)
              </div>
            )}
            {validationResult.errors.length > 0 && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {validationResult.errors.length} error(s)
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep === wizardSteps.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!validationResult.valid}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Create Trial
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function TrialOverviewStep({ trialData, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Trial Name *
        </label>
        <input
          type="text"
          value={trialData.name || ''}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g., LED Spectrum Optimization for Microgreens"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={trialData.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="Describe the purpose and context of your trial..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Research Hypothesis *
        </label>
        <textarea
          value={trialData.hypothesis || ''}
          onChange={(e) => onUpdate({ hypothesis: e.target.value })}
          rows={2}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g., Adding far-red light will increase microgreens yield by 15%"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Objectives
        </label>
        <div className="space-y-2">
          {(trialData.objectives || []).map((objective: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={objective}
                onChange={(e) => {
                  const newObjectives = [...(trialData.objectives || [])];
                  newObjectives[index] = e.target.value;
                  onUpdate({ objectives: newObjectives });
                }}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  const newObjectives = (trialData.objectives || []).filter((_: any, i: number) => i !== index);
                  onUpdate({ objectives: newObjectives });
                }}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newObjectives = [...(trialData.objectives || []), ''];
              onUpdate({ objectives: newObjectives });
            }}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            + Add Objective
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateSelectionStep({ trialData, onUpdate }: any) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const applyTemplate = (template: TrialTemplate) => {
    onUpdate({
      name: template.name,
      description: template.description,
      experimentalDesign: template.designTemplate,
      measurements: template.measurementTemplates,
      tags: [template.category, 'template']
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MICROGREENS_TRIAL_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className={`bg-gray-800 border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-white">{template.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  {template.validationLevel}
                </span>
                <span className="text-xs text-gray-400">
                  {Math.round(template.successRate * 100)}% success
                </span>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-3">{template.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-400">{template.category}</span>
              {selectedTemplate === template.id && (
                <button
                  onClick={() => applyTemplate(template)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Apply Template
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <span className="font-medium text-white">Custom Trial</span>
        </div>
        <p className="text-gray-400 text-sm">
          Start with a blank trial design for complete customization. This option gives you 
          full control over all experimental parameters but requires more setup time.
        </p>
        <button
          onClick={() => setSelectedTemplate('custom')}
          className="mt-3 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Start Custom Trial
        </button>
      </div>
    </div>
  );
}

// Additional step components would be implemented here...
function ExperimentalDesignStep({ trialData, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center text-gray-400">
        Experimental Design Step - Implementation in progress
      </div>
    </div>
  );
}

function MeasurementsStep({ trialData, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center text-gray-400">
        Measurements Step - Implementation in progress
      </div>
    </div>
  );
}

function StatisticsStep({ trialData, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center text-gray-400">
        Statistics Step - Implementation in progress
      </div>
    </div>
  );
}

function ReviewStep({ trialData, validationResult }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-2">Trial Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Name:</span>
            <span className="text-white">{trialData.name || 'Untitled Trial'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Treatments:</span>
            <span className="text-white">{(trialData.treatments || []).length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Measurements:</span>
            <span className="text-white">{(trialData.measurements || []).length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Replicates:</span>
            <span className="text-white">{trialData.experimentalDesign?.replicates || 0}</span>
          </div>
        </div>
      </div>

      {validationResult.warnings.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <h4 className="font-medium text-yellow-400 mb-2">Warnings</h4>
          <ul className="space-y-1">
            {validationResult.warnings.map((warning: string, index: number) => (
              <li key={index} className="text-yellow-300 text-sm">• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {validationResult.errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <h4 className="font-medium text-red-400 mb-2">Errors</h4>
          <ul className="space-y-1">
            {validationResult.errors.map((error: string, index: number) => (
              <li key={index} className="text-red-300 text-sm">• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}