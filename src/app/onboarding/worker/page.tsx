'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, ChevronRight, Check, Smartphone, MapPin, Bell, 
  Shield, Users, Award, PlayCircle, AlertTriangle, Target,
  Zap, Eye, Package, Bug, Wrench, CheckCircle, Info
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: React.ReactNode;
}

export default function WorkerOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Visual Operations',
      description: 'Turn your smartphone into a powerful facility monitoring tool',
      icon: Camera,
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
            <Camera className="w-16 h-16 text-purple-500" />
          </div>
          <h2 className="text-3xl font-bold text-white">Welcome to Visual Operations!</h2>
          <p className="text-lg text-gray-300 max-w-md mx-auto">
            You're about to become a critical part of your facility's intelligence network. 
            Your photos help detect issues early and save thousands of dollars.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">94%</div>
              <div className="text-sm text-gray-400">AI Accuracy</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">30s</div>
              <div className="text-sm text-gray-400">Analysis Time</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-sm text-gray-400">Support</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'permissions',
      title: 'Enable Key Features',
      description: 'Allow camera, location, and notifications for the best experience',
      icon: Smartphone,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Enable Key Features</h2>
          <p className="text-gray-300">
            Visual Operations needs a few permissions to work effectively. 
            Your privacy is protected and data is only used for facility operations.
          </p>
          
          <div className="space-y-4">
            {/* Camera Permission */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Camera Access</h3>
                  <p className="text-sm text-gray-400 mb-3">Required to take photos of issues</p>
                  <button 
                    onClick={() => {
                      // In production, trigger actual permission request
                      alert('Camera permission would be requested here');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Enable Camera
                  </button>
                </div>
              </div>
            </div>

            {/* Location Permission */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Location Services</h3>
                  <p className="text-sm text-gray-400 mb-3">Automatically tag photo locations</p>
                  <button 
                    onClick={() => {
                      setLocationEnabled(true);
                      navigator.geolocation.getCurrentPosition(() => {});
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      locationEnabled 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {locationEnabled ? '✓ Enabled' : 'Enable Location'}
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications Permission */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Push Notifications</h3>
                  <p className="text-sm text-gray-400 mb-3">Get alerts for urgent issues</p>
                  <button 
                    onClick={() => {
                      setNotificationsEnabled(true);
                      if ('Notification' in window) {
                        Notification.requestPermission();
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      notificationsEnabled 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {notificationsEnabled ? '✓ Enabled' : 'Enable Notifications'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-white mb-1">Your Privacy is Protected</p>
                <p>Location data is only used for photo tagging. We never track your personal movements.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'report-types',
      title: 'Choose Your Focus Areas',
      description: "Select the types of issues you'll be reporting",
      icon: Eye,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">What Will You Be Reporting?</h2>
          <p className="text-gray-300">
            Select the types of issues you'll commonly encounter. You can always report other issues too.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'pest', icon: Bug, label: 'Pests & Diseases', color: 'red' },
              { id: 'equipment', icon: Wrench, label: 'Equipment Issues', color: 'orange' },
              { id: 'safety', icon: Shield, label: 'Safety Hazards', color: 'red' },
              { id: 'quality', icon: Eye, label: 'Quality Control', color: 'indigo' },
              { id: 'inventory', icon: Package, label: 'Inventory', color: 'green' },
              { id: 'electrical', icon: Zap, label: 'Electrical', color: 'yellow' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  if (selectedReportTypes.includes(type.id)) {
                    setSelectedReportTypes(selectedReportTypes.filter(t => t !== type.id));
                  } else {
                    setSelectedReportTypes([...selectedReportTypes, type.id]);
                  }
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedReportTypes.includes(type.id)
                    ? `border-${type.color}-500 bg-${type.color}-500/20`
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <type.icon className={`w-8 h-8 mx-auto mb-2 text-${type.color}-400`} />
                <div className="text-sm font-medium text-white">{type.label}</div>
              </button>
            ))}
          </div>

          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-400 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-white mb-1">Quick Actions</p>
                <p>Based on your selections, we'll customize your quick action buttons for faster reporting.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'photo-tutorial',
      title: 'Taking Great Photos',
      description: 'Learn how to capture photos that help our AI work best',
      icon: Camera,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Photo Best Practices</h2>
          <p className="text-gray-300">
            Good photos = better AI analysis = faster problem resolution
          </p>
          
          <div className="space-y-4">
            {/* Good Photo Example */}
            <div className="bg-gray-800 rounded-lg p-6 border border-green-600/30">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Do This - Good Photos
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Good lighting - use flash if needed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Multiple angles of the issue</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Include context (wider view)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Focus on the problem area</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Steady hands (no blur)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-gray-300">Clean camera lens</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bad Photo Example */}
            <div className="bg-gray-800 rounded-lg p-6 border border-red-600/30">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Avoid This - Poor Photos
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5" />
                    <span className="text-gray-300">Too dark or overexposed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5" />
                    <span className="text-gray-300">Blurry or out of focus</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5" />
                    <span className="text-gray-300">Too far away</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5" />
                    <span className="text-gray-300">Fingers covering lens</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5" />
                    <span className="text-gray-300">Wrong angle</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5" />
                    <span className="text-gray-300">No context shown</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800/30">
            <div className="flex items-center gap-3">
              <PlayCircle className="w-5 h-5 text-blue-400" />
              <div className="text-sm text-gray-300">
                <span className="font-medium text-white">Interactive Tutorial: </span>
                Try our practice mode to take sample photos and get instant feedback!
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: "You're All Set!",
      description: 'Start making a difference in your facility',
      icon: Award,
      content: (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
            <Award className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-white">You're Ready to Go!</h2>
          <p className="text-lg text-gray-300 max-w-md mx-auto">
            You're now equipped to help protect your facility and catch issues before they become expensive problems.
          </p>
          
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-semibold text-white mb-4">Quick Start Guide</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white font-bold">1</span>
                </div>
                <div className="text-sm text-gray-300">
                  Look for the <span className="text-purple-400 font-medium">camera button</span> in your tracking app
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white font-bold">2</span>
                </div>
                <div className="text-sm text-gray-300">
                  Tap the issue type you want to report
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white font-bold">3</span>
                </div>
                <div className="text-sm text-gray-300">
                  Take a photo and add any notes
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white font-bold">4</span>
                </div>
                <div className="text-sm text-gray-300">
                  AI analyzes in 30 seconds and alerts the right people
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 rounded-lg p-4 border border-green-800/30 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-green-400" />
              <div className="text-sm text-gray-300 text-left">
                <span className="font-medium text-white">Your First Goal: </span>
                Report 5 issues this week to earn your Visual Ops Champion badge!
              </div>
            </div>
          </div>
          
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/30 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              <div className="text-sm text-gray-300 text-left">
                <span className="font-medium text-white">Continue Learning: </span>
                Access training modules and earn certifications in the Training Portal
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      router.push('/dashboard?onboarding=complete');
    }
  };

  const handleSkip = () => {
    router.push('/dashboard?onboarding=skipped');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </h3>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              Skip onboarding
            </button>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                index === currentStep
                  ? 'bg-purple-600 text-white scale-110'
                  : completedSteps.includes(index)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              {completedSteps.includes(index) ? (
                <Check className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 0
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            disabled={currentStep === 0}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
          >
            {currentStep === steps.length - 1 ? 'Start Using Visual Ops' : 'Continue'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}