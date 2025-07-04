'use client';

import React, { useState } from 'react';
import {
  Beaker,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  Lightbulb,
  Target,
  Droplets,
  TrendingUp,
  FileText,
  Zap
} from 'lucide-react';
import { WaterIonAnalysis } from './WaterIonAnalysis';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  helpText: string;
}

const steps: WizardStep[] = [
  {
    id: 1,
    title: 'Water Source',
    description: 'Tell us about your water',
    icon: <Droplets className="w-6 h-6" />,
    helpText: 'Different water sources have different characteristics. City water is usually consistent, well water varies by location.'
  },
  {
    id: 2,
    title: 'Basic Test',
    description: 'Enter simple measurements',
    icon: <Beaker className="w-6 h-6" />,
    helpText: 'You can get these from a basic water test kit or your water provider. EC and pH are the most important.'
  },
  {
    id: 3,
    title: 'Your Crop',
    description: 'What are you growing?',
    icon: <Target className="w-6 h-6" />,
    helpText: 'Different crops have different water quality preferences. We\'ll optimize recommendations for your specific crop.'
  },
  {
    id: 4,
    title: 'Quick Results',
    description: 'See what matters most',
    icon: <TrendingUp className="w-6 h-6" />,
    helpText: 'We\'ll show you the key things to watch and any immediate actions needed.'
  }
];

export function WaterAnalysisWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);
  
  // User inputs
  const [waterSource, setWaterSource] = useState<'city' | 'well' | 'ro' | 'surface'>('city');
  const [basicMeasurements, setBasicMeasurements] = useState({
    ph: 7.0,
    ec: 0.5,
    ppm: 320,
    hasFullTest: false
  });
  const [cropType, setCropType] = useState<'cannabis' | 'tomato' | 'lettuce' | 'herbs'>('cannabis');
  const [growthStage, setGrowthStage] = useState<'seedling' | 'vegetative' | 'flowering' | 'fruiting'>('vegetative');

  // Simplified analysis results
  const getSimpleAnalysis = () => {
    const issues: Array<{
      severity: 'good' | 'warning' | 'critical';
      message: string;
      action: string;
    }> = [];

    // pH Analysis
    if (basicMeasurements.ph < 5.5) {
      issues.push({
        severity: 'critical',
        message: 'Your water is too acidic',
        action: 'Add pH up solution or use lime'
      });
    } else if (basicMeasurements.ph > 7.5) {
      issues.push({
        severity: 'warning',
        message: 'Your water is too alkaline',
        action: 'Use pH down solution or sulfuric acid'
      });
    } else if (basicMeasurements.ph >= 6.0 && basicMeasurements.ph <= 6.5) {
      issues.push({
        severity: 'good',
        message: 'pH is perfect for nutrient uptake',
        action: 'No adjustment needed'
      });
    }

    // EC Analysis
    if (basicMeasurements.ec > 0.7) {
      issues.push({
        severity: 'warning',
        message: 'High salt content in water',
        action: 'Consider diluting with RO water or adjusting fertilizer'
      });
    } else if (basicMeasurements.ec < 0.3) {
      issues.push({
        severity: 'good',
        message: 'Low salt content - good for adding nutrients',
        action: 'You have flexibility with fertilizer rates'
      });
    }

    // Source-specific advice
    if (waterSource === 'well') {
      issues.push({
        severity: 'warning',
        message: 'Well water can vary seasonally',
        action: 'Test quarterly and after heavy rain'
      });
    } else if (waterSource === 'city') {
      issues.push({
        severity: 'warning',
        message: 'City water may contain chlorine/chloramine',
        action: 'Let water sit 24hrs or use dechlorinator'
      });
    }

    return issues;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">What\'s your water source?</h3>
              <p className="text-gray-400 mb-6">This helps us understand what to look out for</p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'city', label: 'City/Municipal', desc: 'Treated tap water', icon: '🏙️' },
                  { value: 'well', label: 'Well Water', desc: 'Groundwater from your property', icon: '🏚️' },
                  { value: 'ro', label: 'RO/Filtered', desc: 'Reverse osmosis or filtered', icon: '💧' },
                  { value: 'surface', label: 'Surface Water', desc: 'River, lake, or pond', icon: '🏞️' }
                ].map((source) => (
                  <button
                    key={source.value}
                    onClick={() => setWaterSource(source.value as any)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      waterSource === source.value
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">{source.icon}</div>
                    <div className="font-medium text-white">{source.label}</div>
                    <div className="text-sm text-gray-400">{source.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex gap-3">
                <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300 font-medium mb-1">Pro Tip</p>
                  <p className="text-sm text-gray-300">
                    {waterSource === 'city' && 'City water is consistent but may have chlorine. Great for beginners!'}
                    {waterSource === 'well' && 'Well water varies by location. Get a full test at least once a year.'}
                    {waterSource === 'ro' && 'RO water is very pure. You\'ll need to add Cal-Mag supplements.'}
                    {waterSource === 'surface' && 'Surface water can have pathogens. Consider treatment before use.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Basic Water Test</h3>
              <p className="text-gray-400 mb-6">Enter what you know - even just pH and EC helps!</p>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    pH Level
                    <button
                      onMouseEnter={() => setShowTooltip(1)}
                      onMouseLeave={() => setShowTooltip(null)}
                      className="ml-2 text-gray-500 hover:text-gray-300"
                    >
                      <HelpCircle className="w-4 h-4 inline" />
                    </button>
                  </label>
                  <input
                    type="number"
                    value={basicMeasurements.ph}
                    onChange={(e) => setBasicMeasurements({...basicMeasurements, ph: Number(e.target.value)})}
                    step="0.1"
                    min="0"
                    max="14"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Acidic</span>
                    <span>Neutral (7)</span>
                    <span>Alkaline</span>
                  </div>
                  {showTooltip === 1 && (
                    <div className="absolute z-10 mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 max-w-xs">
                      pH measures acidity. Most plants prefer 6.0-6.5. Cannabis likes 5.8-6.2 in hydro, 6.0-7.0 in soil.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    EC (Electrical Conductivity)
                    <button
                      onMouseEnter={() => setShowTooltip(2)}
                      onMouseLeave={() => setShowTooltip(null)}
                      className="ml-2 text-gray-500 hover:text-gray-300"
                    >
                      <HelpCircle className="w-4 h-4 inline" />
                    </button>
                  </label>
                  <input
                    type="number"
                    value={basicMeasurements.ec}
                    onChange={(e) => {
                      const ec = Number(e.target.value);
                      setBasicMeasurements({
                        ...basicMeasurements, 
                        ec, 
                        ppm: Math.round(ec * 640)
                      });
                    }}
                    step="0.1"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <p className="text-sm text-gray-500 mt-1">≈ {basicMeasurements.ppm} PPM</p>
                  {showTooltip === 2 && (
                    <div className="absolute z-10 mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 max-w-xs">
                      EC measures dissolved salts. Lower is better for source water (under 0.7). You add nutrients on top of this.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={basicMeasurements.hasFullTest}
                    onChange={(e) => setBasicMeasurements({...basicMeasurements, hasFullTest: e.target.checked})}
                    className="w-5 h-5 bg-gray-800 border-gray-600 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">I have a full water test report</span>
                </label>
                {basicMeasurements.hasFullTest && (
                  <p className="text-sm text-gray-400 mt-2 ml-8">
                    Great! You can enter detailed ion concentrations in advanced mode after this wizard.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-300 font-medium mb-1">Don\'t have a meter?</p>
                  <p className="text-sm text-gray-300">
                    A basic pH/EC meter combo costs $20-50 and is essential for growing. Your local hydro store can help!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">What are you growing?</h3>
              <p className="text-gray-400 mb-6">We\'ll customize water recommendations for your crop</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { value: 'cannabis', label: 'Cannabis', icon: '🌿' },
                  { value: 'tomato', label: 'Tomatoes', icon: '🍅' },
                  { value: 'lettuce', label: 'Lettuce/Greens', icon: '🥬' },
                  { value: 'herbs', label: 'Herbs', icon: '🌱' }
                ].map((crop) => (
                  <button
                    key={crop.value}
                    onClick={() => setCropType(crop.value as any)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      cropType === crop.value
                        ? 'border-green-500 bg-green-900/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">{crop.icon}</div>
                    <div className="font-medium text-white">{crop.label}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Growth Stage</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'seedling', label: 'Seedling/Clone' },
                    { value: 'vegetative', label: 'Vegetative' },
                    { value: 'flowering', label: cropType === 'cannabis' ? 'Flowering' : 'Pre-Fruit' },
                    { value: 'fruiting', label: cropType === 'cannabis' ? 'Late Flower' : 'Fruiting' }
                  ].map((stage) => (
                    <button
                      key={stage.value}
                      onClick={() => setGrowthStage(stage.value as any)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        growthStage === stage.value
                          ? 'border-purple-500 bg-purple-900/20 text-white'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {stage.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex gap-3">
                <Target className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-300 font-medium mb-1">Stage-Specific Tips</p>
                  <p className="text-sm text-gray-300">
                    {growthStage === 'seedling' && 'Seedlings need lower EC (0.5-0.8) and stable pH. Be gentle!'}
                    {growthStage === 'vegetative' && 'Veg plants can handle EC 1.2-1.8. Focus on nitrogen.'}
                    {growthStage === 'flowering' && 'Flowering needs EC 1.6-2.2. Watch for calcium/magnesium.'}
                    {growthStage === 'fruiting' && 'Late stage benefits from slight EC reduction and pH stability.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        const issues = getSimpleAnalysis();
        const criticalIssues = issues.filter(i => i.severity === 'critical');
        const warnings = issues.filter(i => i.severity === 'warning');
        const goodNews = issues.filter(i => i.severity === 'good');

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Your Water Analysis</h3>
              <p className="text-gray-400 mb-6">Here\'s what we found and what to do about it</p>

              {/* Quick Status */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-white">Overall Water Quality</h4>
                  <div className={`px-4 py-2 rounded-full font-medium ${
                    criticalIssues.length > 0 ? 'bg-red-900/20 text-red-400' :
                    warnings.length > 2 ? 'bg-yellow-900/20 text-yellow-400' :
                    'bg-green-900/20 text-green-400'
                  }`}>
                    {criticalIssues.length > 0 ? 'Needs Attention' :
                     warnings.length > 2 ? 'Fair' : 'Good'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-white">{basicMeasurements.ph}</p>
                    <p className="text-sm text-gray-400">pH</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{basicMeasurements.ec}</p>
                    <p className="text-sm text-gray-400">EC (mS/cm)</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{basicMeasurements.ppm}</p>
                    <p className="text-sm text-gray-400">TDS (ppm)</p>
                  </div>
                </div>
              </div>

              {/* Issues and Recommendations */}
              <div className="space-y-4">
                {criticalIssues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Critical Issues
                    </h4>
                    {criticalIssues.map((issue, idx) => (
                      <div key={idx} className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-3">
                        <p className="font-medium text-white mb-1">{issue.message}</p>
                        <p className="text-sm text-gray-300">
                          <strong>Action:</strong> {issue.action}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {warnings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Things to Watch
                    </h4>
                    {warnings.map((issue, idx) => (
                      <div key={idx} className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-3">
                        <p className="font-medium text-white mb-1">{issue.message}</p>
                        <p className="text-sm text-gray-300">
                          <strong>Tip:</strong> {issue.action}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {goodNews.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Looking Good
                    </h4>
                    {goodNews.map((issue, idx) => (
                      <div key={idx} className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mb-3">
                        <p className="font-medium text-white mb-1">{issue.message}</p>
                        <p className="text-sm text-gray-300">{issue.action}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next Steps */}
              <div className="mt-6 p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Recommended Next Steps
                </h4>
                <ol className="space-y-2 text-sm text-gray-300">
                  <li>1. Address any critical issues first (red items above)</li>
                  <li>2. Get a full water test if you haven\'t already ($30-50)</li>
                  <li>3. Consider advanced analysis for precise nutrient planning</li>
                  <li>4. Keep a log of your water tests - it changes over time!</li>
                </ol>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showAdvancedMode) {
    return <WaterIonAnalysis />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Water Analysis Wizard</h2>
            <button
              onClick={() => setShowAdvancedMode(true)}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Switch to Advanced Mode →
            </button>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    currentStep > step.id ? 'bg-green-600 text-white' :
                    currentStep === step.id ? 'bg-purple-600 text-white' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`text-sm hidden md:block ${
                    currentStep >= step.id ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 transition-colors ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-900/20 rounded-xl text-purple-400">
              {steps[currentStep - 1].icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{steps[currentStep - 1].title}</h3>
              <p className="text-sm text-gray-400">{steps[currentStep - 1].description}</p>
            </div>
          </div>

          {renderStepContent()}

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                {steps[currentStep - 1].helpText}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={() => {
                if (currentStep === steps.length) {
                  if (basicMeasurements.hasFullTest) {
                    setShowAdvancedMode(true);
                  }
                } else {
                  setCurrentStep(Math.min(steps.length, currentStep + 1));
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              {currentStep === steps.length ? (
                basicMeasurements.hasFullTest ? 'Go to Advanced Analysis' : 'Done'
              ) : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-900/20 rounded-lg">
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="font-medium text-white">pH Matters Most</h4>
          </div>
          <p className="text-sm text-gray-400">
            Wrong pH locks out nutrients. Aim for 6.0-6.5 in soil, 5.8-6.2 in hydro.
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-900/20 rounded-lg">
              <Beaker className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="font-medium text-white">Test Regularly</h4>
          </div>
          <p className="text-sm text-gray-400">
            Water quality changes. Test source water monthly, nutrient solution daily.
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-900/20 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="font-medium text-white">Keep Records</h4>
          </div>
          <p className="text-sm text-gray-400">
            Track your water tests. Patterns help you prevent problems before they start.
          </p>
        </div>
      </div>
    </div>
  );
}