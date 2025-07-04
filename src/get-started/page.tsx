'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, Building, Leaf, Package, TrendingUp, 
  ArrowRight, CheckCircle, Zap, Users, BarChart3,
  Shield, Clock, DollarSign, ChevronRight, Loader2,
  Thermometer, Droplets, Sun, Wind
} from 'lucide-react';

interface OnboardingData {
  facilityType: string;
  facilitySize: string;
  crops: string[];
  goals: string[];
  equipment: string[];
  experience: string;
  budget: string;
  timeline: string;
}

export default function GetStartedPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    facilityType: '',
    facilitySize: '',
    crops: [],
    goals: [],
    equipment: [],
    experience: '',
    budget: '',
    timeline: ''
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save onboarding data
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Vibelux</span>
          </Link>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-400">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">Tell us about your facility</h2>
                <p className="text-gray-400">This helps us customize VibeLux for your specific needs</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  What type of facility do you operate?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'greenhouse', label: 'Greenhouse', icon: Building },
                    { value: 'vertical-farm', label: 'Vertical Farm', icon: Building },
                    { value: 'indoor-grow', label: 'Indoor Grow', icon: Building },
                    { value: 'container-farm', label: 'Container Farm', icon: Package }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, facilityType: option.value })}
                      className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        data.facilityType === option.value
                          ? 'bg-purple-600/10 border-purple-500'
                          : 'bg-gray-800 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <option.icon className="w-6 h-6 text-purple-400" />
                      <span className="font-medium text-white">{option.label}</span>
                      {data.facilityType === option.value && (
                        <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  What's your facility size?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'small', label: 'Small', description: '< 10,000 sq ft' },
                    { value: 'medium', label: 'Medium', description: '10,000 - 50,000 sq ft' },
                    { value: 'large', label: 'Large', description: '> 50,000 sq ft' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, facilitySize: option.value })}
                      className={`relative p-4 rounded-xl border transition-all ${
                        data.facilitySize === option.value
                          ? 'bg-purple-600/10 border-purple-500'
                          : 'bg-gray-800 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="font-medium text-white mb-1">{option.label}</div>
                      <div className="text-sm text-gray-400">{option.description}</div>
                      {data.facilitySize === option.value && (
                        <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">What do you grow?</h2>
                <p className="text-gray-400">Select all that apply</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Primary crops
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'leafy-greens', label: 'Leafy Greens', icon: Leaf },
                    { value: 'herbs', label: 'Herbs', icon: Leaf },
                    { value: 'tomatoes', label: 'Tomatoes', icon: Leaf },
                    { value: 'berries', label: 'Berries', icon: Leaf },
                    { value: 'cannabis', label: 'Cannabis', icon: Leaf },
                    { value: 'flowers', label: 'Flowers', icon: Leaf },
                    { value: 'microgreens', label: 'Microgreens', icon: Leaf },
                    { value: 'mushrooms', label: 'Mushrooms', icon: Leaf },
                    { value: 'other', label: 'Other', icon: Leaf }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ 
                        ...data, 
                        crops: toggleArrayItem(data.crops, option.value)
                      })}
                      className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        data.crops.includes(option.value)
                          ? 'bg-purple-600/10 border-purple-500'
                          : 'bg-gray-800 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <option.icon className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">{option.label}</span>
                      {data.crops.includes(option.value) && (
                        <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  How experienced are you with CEA?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'beginner', label: 'Beginner', description: 'New to controlled environment agriculture' },
                    { value: 'intermediate', label: 'Intermediate', description: '1-3 years of experience' },
                    { value: 'expert', label: 'Expert', description: '3+ years of experience' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, experience: option.value })}
                      className={`relative p-4 rounded-xl border transition-all ${
                        data.experience === option.value
                          ? 'bg-purple-600/10 border-purple-500'
                          : 'bg-gray-800 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="font-medium text-white mb-1">{option.label}</div>
                      <div className="text-xs text-gray-400">{option.description}</div>
                      {data.experience === option.value && (
                        <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">What are your main goals?</h2>
                <p className="text-gray-400">Select your top priorities</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'increase-yield', label: 'Increase Yield', description: 'Maximize production output', icon: TrendingUp },
                  { value: 'reduce-costs', label: 'Reduce Costs', description: 'Lower operational expenses', icon: DollarSign },
                  { value: 'improve-quality', label: 'Improve Quality', description: 'Enhance crop quality', icon: Shield },
                  { value: 'save-energy', label: 'Save Energy', description: 'Reduce energy consumption', icon: Zap },
                  { value: 'automate', label: 'Automate Operations', description: 'Streamline workflows', icon: Clock },
                  { value: 'scale', label: 'Scale Production', description: 'Expand operations', icon: BarChart3 }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setData({ 
                      ...data, 
                      goals: toggleArrayItem(data.goals, option.value)
                    })}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      data.goals.includes(option.value)
                        ? 'bg-purple-600/10 border-purple-500'
                        : 'bg-gray-800 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <option.icon className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                    <div className="text-left">
                      <div className="font-medium text-white">{option.label}</div>
                      <div className="text-sm text-gray-400 mt-1">{option.description}</div>
                    </div>
                    {data.goals.includes(option.value) && (
                      <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">Equipment & Investment</h2>
                <p className="text-gray-400">Help us understand your equipment needs</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  What equipment are you interested in?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'led-lights', label: 'LED Grow Lights', icon: Sun },
                    { value: 'hvac', label: 'HVAC Systems', icon: Wind },
                    { value: 'sensors', label: 'Environmental Sensors', icon: Thermometer },
                    { value: 'irrigation', label: 'Irrigation Systems', icon: Droplets },
                    { value: 'automation', label: 'Automation Controls', icon: Zap },
                    { value: 'software', label: 'Software Only', icon: BarChart3 }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ 
                        ...data, 
                        equipment: toggleArrayItem(data.equipment, option.value)
                      })}
                      className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        data.equipment.includes(option.value)
                          ? 'bg-purple-600/10 border-purple-500'
                          : 'bg-gray-800 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <option.icon className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">{option.label}</span>
                      {data.equipment.includes(option.value) && (
                        <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Equipment budget range
                  </label>
                  <select
                    value={data.budget}
                    onChange={(e) => setData({ ...data, budget: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select budget</option>
                    <option value="0-50k">$0 - $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="100k-250k">$100,000 - $250,000</option>
                    <option value="250k-500k">$250,000 - $500,000</option>
                    <option value="500k+">$500,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Timeline for investment
                  </label>
                  <select
                    value={data.timeline}
                    onChange={(e) => setData({ ...data, timeline: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate</option>
                    <option value="1-3-months">1-3 months</option>
                    <option value="3-6-months">3-6 months</option>
                    <option value="6-12-months">6-12 months</option>
                    <option value="12-months+">12+ months</option>
                  </select>
                </div>
              </div>

              {/* Revenue Sharing Callout */}
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-start gap-4">
                  <DollarSign className="w-8 h-8 text-purple-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">$0 Upfront Equipment Program</h3>
                    <p className="text-gray-300">
                      Interested in getting equipment with no upfront costs? Our revenue sharing program 
                      connects you with investors who fund your equipment in exchange for a share of revenue.
                    </p>
                    <Link 
                      href="/equipment-board"
                      className="inline-flex items-center gap-2 mt-3 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Learn more <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className={`${step === 1 ? 'w-full' : 'ml-auto'} flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up your account...
                </>
              ) : step === totalSteps ? (
                <>
                  Complete Setup
                  <CheckCircle className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}