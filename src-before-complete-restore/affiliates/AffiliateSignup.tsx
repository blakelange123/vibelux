/**
 * Affiliate Program Signup Component
 * Application form for new affiliates
 */

'use client'

import React, { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { 
  User, 
  Globe, 
  Users, 
  TrendingUp,
  DollarSign,
  Check,
  ArrowRight,
  Instagram,
  Twitter,
  Youtube
} from 'lucide-react'

interface AffiliateApplication {
  companyName: string
  website: string
  socialMedia: {
    instagram?: string
    twitter?: string
    youtube?: string
    tiktok?: string
  }
  audienceSize: number
  niche: string[]
  experience: string
  promotionMethods: string[]
  requestedCommissionRate: number
  additionalInfo: string
}

export function AffiliateSignup() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [application, setApplication] = useState<AffiliateApplication>({
    companyName: '',
    website: '',
    socialMedia: {},
    audienceSize: 0,
    niche: [],
    experience: '',
    promotionMethods: [],
    requestedCommissionRate: 5,
    additionalInfo: ''
  })

  const steps = [
    { id: 1, title: 'Basic Information', icon: User },
    { id: 2, title: 'Audience & Reach', icon: Users },
    { id: 3, title: 'Experience & Methods', icon: TrendingUp },
    { id: 4, title: 'Commission & Review', icon: DollarSign }
  ]

  const niches = [
    'Indoor Growing',
    'Hydroponics',
    'Cannabis Cultivation',
    'Vertical Farming',
    'Commercial Agriculture',
    'Home Gardening',
    'Sustainability',
    'Technology Reviews',
    'Agriculture Education',
    'Plant Biology'
  ]

  const promotionMethods = [
    'Blog Content',
    'Social Media Posts',
    'YouTube Videos',
    'Email Marketing',
    'Product Reviews',
    'Tutorials/Guides',
    'Webinars',
    'Paid Advertising',
    'Influencer Partnerships',
    'Trade Shows'
  ]

  const handleInputChange = (field: string, value: any) => {
    setApplication(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setApplication(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }

  const handleArrayFieldChange = (field: string, value: string, checked: boolean) => {
    setApplication(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }))
  }

  const submitApplication = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/affiliates/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(application)
      })

      if (response.ok) {
        // Show success message and redirect
        alert('Application submitted successfully! We\'ll review it within 2-3 business days.')
        window.location.href = '/affiliates'
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Application submission error:', error)
      alert('Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return application.companyName && application.website
      case 2:
        return application.audienceSize > 0 && application.niche.length > 0
      case 3:
        return application.experience && application.promotionMethods.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Join the VibeLux Affiliate Program
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Partner with us to earn competitive commissions promoting premium LED grow lights
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Up to 10% Commission
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Competitive rates based on performance
          </p>
        </div>
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            30-Day Cookie
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Long attribution window for conversions
          </p>
        </div>
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users className="h-8 w-8 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Marketing Support
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Assets, content, and dedicated support
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-600 border-green-600 text-white'
                    : isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block w-24 h-0.5 ml-6 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company/Brand Name *
              </label>
              <input
                type="text"
                value={application.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Your company or personal brand name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website URL *
              </label>
              <input
                type="url"
                value={application.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Social Media Profiles (Optional)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Instagram size={16} className="inline mr-2" />
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={application.socialMedia.instagram || ''}
                    onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Twitter size={16} className="inline mr-2" />
                    Twitter/X
                  </label>
                  <input
                    type="text"
                    value={application.socialMedia.twitter || ''}
                    onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Youtube size={16} className="inline mr-2" />
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={application.socialMedia.youtube || ''}
                    onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                    placeholder="Channel URL"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    TikTok
                  </label>
                  <input
                    type="text"
                    value={application.socialMedia.tiktok || ''}
                    onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Audience & Reach */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Audience & Reach
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Audience Size *
              </label>
              <select
                value={application.audienceSize}
                onChange={(e) => handleInputChange('audienceSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value={0}>Select audience size</option>
                <option value={1000}>1,000 - 5,000</option>
                <option value={5000}>5,000 - 10,000</option>
                <option value={10000}>10,000 - 25,000</option>
                <option value={25000}>25,000 - 50,000</option>
                <option value={50000}>50,000 - 100,000</option>
                <option value={100000}>100,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Content Niches * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {niches.map((niche) => (
                  <label key={niche} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={application.niche.includes(niche)}
                      onChange={(e) => handleArrayFieldChange('niche', niche, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {niche}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Experience & Methods */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Experience & Promotion Methods
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Affiliate Marketing Experience *
              </label>
              <select
                value={application.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select experience level</option>
                <option value="beginner">Beginner (0-1 years)</option>
                <option value="intermediate">Intermediate (1-3 years)</option>
                <option value="experienced">Experienced (3-5 years)</option>
                <option value="expert">Expert (5+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Promotion Methods * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {promotionMethods.map((method) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={application.promotionMethods.includes(method)}
                      onChange={(e) => handleArrayFieldChange('promotionMethods', method, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {method}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Information
              </label>
              <textarea
                value={application.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder="Tell us more about your audience, content strategy, or why you'd like to partner with VibeLux..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Step 4: Commission & Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Commission & Final Review
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Requested Commission Rate
              </label>
              <select
                value={application.requestedCommissionRate}
                onChange={(e) => handleInputChange('requestedCommissionRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={5}>5% (Standard)</option>
                <option value={7}>7% (Experienced affiliates)</option>
                <option value={10}>10% (High-volume partners)</option>
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Final rate will be determined based on your application and performance potential.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Application Summary
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Company:</strong> {application.companyName}</p>
                <p><strong>Website:</strong> {application.website}</p>
                <p><strong>Audience Size:</strong> {application.audienceSize.toLocaleString()}+</p>
                <p><strong>Niches:</strong> {application.niche.join(', ')}</p>
                <p><strong>Experience:</strong> {application.experience}</p>
                <p><strong>Promotion Methods:</strong> {application.promotionMethods.join(', ')}</p>
                <p><strong>Requested Rate:</strong> {application.requestedCommissionRate}%</p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-md font-medium text-blue-900 dark:text-blue-100 mb-2">
                What happens next?
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                <li>• We'll review your application within 2-3 business days</li>
                <li>• You'll receive an email with our decision and next steps</li>
                <li>• Approved affiliates get access to marketing materials and tracking tools</li>
                <li>• Start earning commissions immediately upon approval</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={submitApplication}
              disabled={isSubmitting || !canProceed()}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <Check size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}