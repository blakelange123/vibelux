'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  Lightbulb,
  Leaf,
  Wifi,
  BarChart3,
  Users,
  Settings,
  Zap,
  Camera,
  Package,
  Brain,
  Layers,
  DollarSign,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react'

interface WizardStep {
  id: string
  title: string
  description: string
  icon: any
  route: string
  category: 'setup' | 'design' | 'monitor' | 'optimize'
  recommended?: boolean
  dependencies?: string[]
  estimatedTime?: string
}

interface UserProfile {
  facilityType: 'indoor' | 'greenhouse' | 'vertical' | null
  facilitySize: 'small' | 'medium' | 'large' | null
  primaryCrop: string | null
  experience: 'beginner' | 'intermediate' | 'expert' | null
  goals: string[]
}

export function QuickStartWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    facilityType: null,
    facilitySize: null,
    primaryCrop: null,
    experience: null,
    goals: []
  })
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [showWizard, setShowWizard] = useState(true)

  // Define all available steps
  const allSteps: WizardStep[] = [
    // Setup Steps
    {
      id: 'facility-setup',
      title: 'Facility Configuration',
      description: 'Define your growing facility type and specifications',
      icon: Building2,
      route: '/cultivation',
      category: 'setup',
      estimatedTime: '5 min'
    },
    {
      id: 'sensor-integration',
      title: 'Connect Sensors',
      description: 'Integrate IoT sensors for environmental monitoring',
      icon: Wifi,
      route: '/sensors',
      category: 'setup',
      recommended: true,
      estimatedTime: '10 min'
    },
    {
      id: 'camera-setup',
      title: 'Camera Systems',
      description: 'Set up cameras for plant health monitoring',
      icon: Camera,
      route: '/integrations',
      category: 'setup',
      estimatedTime: '15 min'
    },
    
    // Design Steps
    {
      id: 'lighting-design',
      title: 'Create Lighting Design',
      description: 'Design optimal lighting layout for your facility',
      icon: Lightbulb,
      route: '/design/advanced',
      category: 'design',
      recommended: true,
      dependencies: ['facility-setup'],
      estimatedTime: '20 min'
    },
    {
      id: 'fixture-selection',
      title: 'Select Fixtures',
      description: 'Choose appropriate grow lights from our database',
      icon: Package,
      route: '/fixtures',
      category: 'design',
      dependencies: ['lighting-design'],
      estimatedTime: '10 min'
    },
    {
      id: 'spectrum-optimization',
      title: 'Optimize Spectrum',
      description: 'Fine-tune light spectrum for your crops',
      icon: Zap,
      route: '/spectrum',
      category: 'design',
      dependencies: ['fixture-selection'],
      estimatedTime: '15 min'
    },
    
    // Monitor Steps
    {
      id: 'control-center',
      title: 'Control Center Setup',
      description: 'Configure unified environmental control',
      icon: Settings,
      route: '/control-center',
      category: 'monitor',
      recommended: true,
      dependencies: ['sensor-integration'],
      estimatedTime: '10 min'
    },
    {
      id: 'crop-monitoring',
      title: 'Crop Monitoring',
      description: 'Set up plant health and growth tracking',
      icon: Leaf,
      route: '/cultivation',
      category: 'monitor',
      dependencies: ['camera-setup'],
      estimatedTime: '15 min'
    },
    {
      id: 'analytics-setup',
      title: 'Analytics Dashboard',
      description: 'Configure performance metrics and reporting',
      icon: BarChart3,
      route: '/analytics',
      category: 'monitor',
      estimatedTime: '5 min'
    },
    
    // Optimize Steps
    {
      id: 'ai-automation',
      title: 'AI Automation',
      description: 'Enable predictive analytics and automation',
      icon: Brain,
      route: '/predictions',
      category: 'optimize',
      recommended: true,
      dependencies: ['control-center', 'analytics-setup'],
      estimatedTime: '10 min'
    },
    {
      id: 'energy-optimization',
      title: 'Energy Management',
      description: 'Optimize energy usage and demand response',
      icon: DollarSign,
      route: '/demand-response',
      category: 'optimize',
      estimatedTime: '15 min'
    },
    {
      id: 'team-collaboration',
      title: 'Team Setup',
      description: 'Invite team members and set permissions',
      icon: Users,
      route: '/settings/team',
      category: 'optimize',
      estimatedTime: '5 min'
    }
  ]

  // Profile questions
  const profileQuestions = [
    {
      id: 'facilityType',
      question: 'What type of facility do you operate?',
      options: [
        { value: 'indoor', label: 'Indoor Farm', icon: Building2 },
        { value: 'greenhouse', label: 'Greenhouse', icon: Leaf },
        { value: 'vertical', label: 'Vertical Farm', icon: Layers }
      ]
    },
    {
      id: 'facilitySize',
      question: 'How large is your facility?',
      options: [
        { value: 'small', label: 'Small (<5,000 sq ft)', icon: null },
        { value: 'medium', label: 'Medium (5,000-20,000 sq ft)', icon: null },
        { value: 'large', label: 'Large (>20,000 sq ft)', icon: null }
      ]
    },
    {
      id: 'experience',
      question: 'What\'s your experience level?',
      options: [
        { value: 'beginner', label: 'New to controlled environment', icon: null },
        { value: 'intermediate', label: 'Some experience', icon: null },
        { value: 'expert', label: 'Experienced grower', icon: null }
      ]
    },
    {
      id: 'goals',
      question: 'What are your primary goals? (Select all that apply)',
      multiple: true,
      options: [
        { value: 'yield', label: 'Maximize Yield' },
        { value: 'quality', label: 'Improve Quality' },
        { value: 'energy', label: 'Reduce Energy Costs' },
        { value: 'automation', label: 'Automate Operations' },
        { value: 'compliance', label: 'Ensure Compliance' }
      ]
    }
  ]

  // Get recommended steps based on profile
  const getRecommendedSteps = (): WizardStep[] => {
    const recommended = allSteps.filter(step => {
      // Basic recommendations
      if (step.recommended) return true
      
      // Facility-specific recommendations
      if (userProfile.facilityType === 'vertical' && step.id === 'multi-tier-design') return true
      if (userProfile.facilityType === 'greenhouse' && step.id === 'supplemental-lighting') return true
      
      // Goal-specific recommendations
      if (userProfile.goals.includes('energy') && step.id === 'energy-optimization') return true
      if (userProfile.goals.includes('automation') && step.id === 'ai-automation') return true
      
      // Experience-based filtering
      if (userProfile.experience === 'beginner' && step.category === 'optimize') return false
      
      return false
    })
    
    // Sort by category and dependencies
    return recommended.sort((a, b) => {
      const categoryOrder = ['setup', 'design', 'monitor', 'optimize']
      return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
    })
  }

  // Check if step is available
  const isStepAvailable = (step: WizardStep): boolean => {
    if (!step.dependencies) return true
    return step.dependencies.every(dep => completedSteps.includes(dep))
  }

  // Handle profile answer
  const handleProfileAnswer = (questionId: string, value: any) => {
    if (questionId === 'goals') {
      setUserProfile(prev => ({
        ...prev,
        goals: prev.goals.includes(value) 
          ? prev.goals.filter(g => g !== value)
          : [...prev.goals, value]
      }))
    } else {
      setUserProfile(prev => ({
        ...prev,
        [questionId]: value
      }))
    }
  }

  // Skip to dashboard
  const skipWizard = () => {
    localStorage.setItem('vibelux-wizard-completed', 'true')
    setShowWizard(false)
    router.push('/dashboard')
  }

  // Start guided setup
  const startGuidedSetup = () => {
    const recommendedSteps = getRecommendedSteps()
    if (recommendedSteps.length > 0) {
      router.push(recommendedSteps[0].route)
      // Mark wizard as in progress
      localStorage.setItem('vibelux-wizard-progress', JSON.stringify({
        currentStep: 0,
        steps: recommendedSteps.map(s => s.id),
        completed: []
      }))
    }
  }

  // Check if wizard was previously completed
  useEffect(() => {
    const wizardCompleted = localStorage.getItem('vibelux-wizard-completed')
    if (wizardCompleted === 'true') {
      setShowWizard(false)
    }
  }, [])

  if (!showWizard) return null

  const currentQuestion = profileQuestions[currentStep]
  const isLastQuestion = currentStep === profileQuestions.length - 1

  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 relative">
          <button
            onClick={skipWizard}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome to VibeLux</h2>
              <p className="text-white/80 mt-1">Let's set up your cultivation platform</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-6 bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / profileQuestions.length) * 100}%` }}
              className="bg-white rounded-full h-full"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {currentStep < profileQuestions.length ? (
              // Profile Questions
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-white">
                  {currentQuestion.question}
                </h3>
                
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = currentQuestion.multiple 
                      ? userProfile.goals.includes(option.value)
                      : userProfile[currentQuestion.id as keyof UserProfile] === option.value
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleProfileAnswer(currentQuestion.id, option.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {'icon' in option && option.icon && <option.icon className="w-5 h-5 text-gray-400" />}
                          <span className="text-white font-medium">{option.label}</span>
                          {isSelected && <Check className="w-5 h-5 text-purple-400 ml-auto" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                    className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                  
                  <button
                    onClick={() => {
                      if (isLastQuestion) {
                        setCurrentStep(prev => prev + 1)
                      } else {
                        setCurrentStep(prev => prev + 1)
                      }
                    }}
                    disabled={
                      !currentQuestion.multiple && 
                      !userProfile[currentQuestion.id as keyof UserProfile] ||
                      currentQuestion.multiple && 
                      userProfile.goals.length === 0
                    }
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {isLastQuestion ? 'View Recommendations' : 'Next'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              // Recommendations
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Your Personalized Setup Path
                  </h3>
                  <p className="text-gray-400">
                    Based on your profile, we recommend completing these steps to get the most from VibeLux.
                  </p>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getRecommendedSteps().map((step, index) => {
                    const Icon = step.icon
                    const available = isStepAvailable(step)
                    
                    return (
                      <div
                        key={step.id}
                        className={`p-4 rounded-xl border ${
                          available
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-800 opacity-50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            step.category === 'setup' ? 'bg-blue-500/20' :
                            step.category === 'design' ? 'bg-purple-500/20' :
                            step.category === 'monitor' ? 'bg-green-500/20' :
                            'bg-orange-500/20'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              step.category === 'setup' ? 'text-blue-400' :
                              step.category === 'design' ? 'text-purple-400' :
                              step.category === 'monitor' ? 'text-green-400' :
                              'text-orange-400'
                            }`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-white">{step.title}</h4>
                              {step.estimatedTime && (
                                <span className="text-xs text-gray-500">
                                  ~{step.estimatedTime}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                              {step.description}
                            </p>
                            {!available && step.dependencies && (
                              <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Complete {step.dependencies.join(', ')} first
                              </p>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-6">
                  <button
                    onClick={skipWizard}
                    className="flex-1 px-6 py-3 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
                  >
                    Skip for Now
                  </button>
                  <button
                    onClick={startGuidedSetup}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    Start Guided Setup
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}