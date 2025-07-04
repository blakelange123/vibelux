'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Building2,
  Leaf,
  Users,
  Zap,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Check,
  Lightbulb,
  Target,
  TrendingUp,
  Package
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to VibeLux',
    description: 'Let\'s get you set up with the most advanced cultivation platform',
    icon: Sparkles
  },
  {
    id: 'role',
    title: 'What\'s your role?',
    description: 'This helps us personalize your experience',
    icon: Users
  },
  {
    id: 'facility',
    title: 'Tell us about your facility',
    description: 'We\'ll customize tools for your operation',
    icon: Building2
  },
  {
    id: 'goals',
    title: 'What are your goals?',
    description: 'Select what you want to achieve',
    icon: Target
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    description: 'Let\'s explore your personalized dashboard',
    icon: Check
  }
];

const roleOptions = [
  { id: 'grower', label: 'Grower/Cultivator', icon: Leaf },
  { id: 'facility-manager', label: 'Facility Manager', icon: Building2 },
  { id: 'consultant', label: 'Consultant', icon: Users },
  { id: 'investor', label: 'Investor', icon: TrendingUp },
  { id: 'other', label: 'Other', icon: Sparkles }
];

const facilityTypes = [
  { id: 'indoor', label: 'Indoor Farm', icon: Building2 },
  { id: 'greenhouse', label: 'Greenhouse', icon: Leaf },
  { id: 'vertical', label: 'Vertical Farm', icon: Package },
  { id: 'hybrid', label: 'Hybrid', icon: Zap }
];

const goals = [
  { id: 'yield', label: 'Increase Yield', icon: TrendingUp },
  { id: 'energy', label: 'Reduce Energy Costs', icon: Zap },
  { id: 'quality', label: 'Improve Quality', icon: Sparkles },
  { id: 'automation', label: 'Automate Operations', icon: BarChart3 },
  { id: 'compliance', label: 'Ensure Compliance', icon: Check },
  { id: 'design', label: 'Design New Facility', icon: Lightbulb }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    role: '',
    facilityType: '',
    facilitySize: '',
    goals: [] as string[],
    experience: ''
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save preferences and redirect to dashboard
      localStorage.setItem('vibelux_onboarding', JSON.stringify({
        ...formData,
        completed: true,
        completedAt: new Date().toISOString()
      }));
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('vibelux_onboarding', JSON.stringify({
      skipped: true,
      skippedAt: new Date().toISOString()
    }));
    router.push('/dashboard');
  };

  const handleRoleSelect = (roleId: string) => {
    setFormData({ ...formData, role: roleId });
  };

  const handleFacilitySelect = (facilityId: string) => {
    setFormData({ ...formData, facilityType: facilityId });
  };

  const handleGoalToggle = (goalId: string) => {
    const newGoals = formData.goals.includes(goalId)
      ? formData.goals.filter(g => g !== goalId)
      : [...formData.goals, goalId];
    setFormData({ ...formData, goals: newGoals });
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-sm text-gray-400">Step {currentStep + 1} of {steps.length}</h1>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Skip for now
            </button>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-2xl p-8 shadow-2xl"
          >
            {/* Step Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-full mb-4">
                <CurrentIcon className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{steps[currentStep].title}</h2>
              <p className="text-gray-400">{steps[currentStep].description}</p>
            </div>

            {/* Step Content */}
            <div className="mb-8">
              {currentStep === 0 && (
                <div className="text-center space-y-4">
                  <p className="text-lg text-gray-300">
                    VibeLux helps you optimize every aspect of your cultivation facility - from lighting design to harvest.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-gray-700 rounded-lg p-6">
                      <Lightbulb className="w-8 h-8 text-yellow-400 mb-3" />
                      <h3 className="font-semibold mb-2">Smart Lighting</h3>
                      <p className="text-sm text-gray-400">AI-powered lighting optimization</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-6">
                      <Zap className="w-8 h-8 text-blue-400 mb-3" />
                      <h3 className="font-semibold mb-2">Energy Savings</h3>
                      <p className="text-sm text-gray-400">Reduce costs by up to 40%</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-6">
                      <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
                      <h3 className="font-semibold mb-2">Higher Yields</h3>
                      <p className="text-sm text-gray-400">Increase yields by 35% average</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          formData.role === role.id
                            ? 'border-purple-500 bg-purple-600/20'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <Icon className="w-8 h-8 text-purple-400 mb-3" />
                        <p className="font-semibold">{role.label}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Facility Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {facilityTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => handleFacilitySelect(type.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              formData.facilityType === type.id
                                ? 'border-purple-500 bg-purple-600/20'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <Icon className="w-6 h-6 text-purple-400 mb-2" />
                            <p className="text-sm font-medium">{type.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Facility Size
                    </label>
                    <select
                      value={formData.facilitySize}
                      onChange={(e) => setFormData({ ...formData, facilitySize: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select size</option>
                      <option value="small">Under 5,000 sq ft</option>
                      <option value="medium">5,000 - 20,000 sq ft</option>
                      <option value="large">20,000 - 50,000 sq ft</option>
                      <option value="xlarge">Over 50,000 sq ft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Experience Level
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select experience</option>
                      <option value="new">New to cultivation</option>
                      <option value="some">1-3 years</option>
                      <option value="experienced">3-5 years</option>
                      <option value="expert">5+ years</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = formData.goals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        onClick={() => handleGoalToggle(goal.id)}
                        className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-600/20'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <Icon className="w-6 h-6 text-purple-400" />
                        <p className="font-medium text-left">{goal.label}</p>
                        {isSelected && <Check className="w-5 h-5 text-purple-400 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Your personalized setup is ready!</h3>
                    <div className="space-y-3 text-left max-w-md mx-auto">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-400" />
                        <span>Custom dashboard configured</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-400" />
                        <span>Relevant tools activated</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-400" />
                        <span>AI recommendations enabled</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-400" />
                        <span>Sample data loaded</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400">
                    You can always change these settings later in your profile.
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !formData.role) ||
                  (currentStep === 2 && (!formData.facilityType || !formData.facilitySize)) ||
                  (currentStep === 3 && formData.goals.length === 0)
                }
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  ((currentStep === 1 && !formData.role) ||
                   (currentStep === 2 && (!formData.facilityType || !formData.facilitySize)) ||
                   (currentStep === 3 && formData.goals.length === 0))
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {currentStep === steps.length - 1 ? 'Go to Dashboard' : 'Next'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}