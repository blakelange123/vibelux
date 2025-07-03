'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  User,
  Briefcase,
  DollarSign,
  Globe,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Plus,
  Award,
  Shield,
  Clock,
  Video,
  MessageSquare
} from 'lucide-react';

import { consultationCategories } from '@/lib/consultation-categories';

const specialtyOptions = consultationCategories.map(category => ({
  value: category.id,
  label: category.name,
  description: category.description,
  icon: category.icon,
  subcategories: category.subcategories.map(sub => ({
    value: sub.id,
    label: sub.name,
    description: sub.description,
    expertiseLevel: sub.expertiseLevel,
    averageRate: sub.averageRate
  }))
}));

interface ApplicationData {
  displayName: string;
  title: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  yearsExperience: number;
  hourlyRate: number;
  linkedinUrl: string;
  websiteUrl: string;
  timezone: string;
  availableDays: number[];
  availableHours: { start: string; end: string };
  whyJoin: string;
  references: string[];
}

export default function ExpertApplicationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newReference, setNewReference] = useState('');

  const [formData, setFormData] = useState<ApplicationData>({
    displayName: '',
    title: '',
    bio: '',
    specialties: [],
    certifications: [],
    yearsExperience: 0,
    hourlyRate: 200,
    linkedinUrl: '',
    websiteUrl: '',
    timezone: 'America/Los_Angeles',
    availableDays: [1, 2, 3, 4, 5], // Mon-Fri
    availableHours: { start: '09:00', end: '17:00' },
    whyJoin: '',
    references: []
  });

  const updateFormData = (field: keyof ApplicationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addReference = () => {
    if (newReference.trim()) {
      setFormData(prev => ({
        ...prev,
        references: [...prev.references, newReference.trim()]
      }));
      setNewReference('');
    }
  };

  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day].sort()
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(formData.displayName && formData.title && formData.bio && formData.yearsExperience > 0);
      case 2:
        return formData.specialties.length > 0 && formData.certifications.length > 0;
      case 3:
        return formData.availableDays.length > 0 && formData.availableHours.start && formData.availableHours.end;
      case 4:
        return !!formData.whyJoin;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/experts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/experts/apply/success');
      } else {
        const error = await response.json();
        setSubmitError(error.error || 'Failed to submit application');
      }
    } catch (error) {
      setSubmitError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gray-950 pt-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-b border-indigo-800/30">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          <Link 
            href="/experts"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Experts
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">Apply to Become an Expert</h1>
          <p className="text-gray-400">Join our platform and share your expertise with growers worldwide</p>
          
          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber <= step 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {stepNumber < step ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-20 h-1 mx-2 ${
                      stepNumber < step ? 'bg-indigo-600' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Profile</span>
              <span>Expertise</span>
              <span>Availability</span>
              <span>Motivation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Step 1: Basic Profile */}
        {step === 1 && (
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-indigo-400" />
              Basic Profile Information
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => updateFormData('displayName', e.target.value)}
                    placeholder="Dr. Sarah Chen"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Professional Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    placeholder="Cannabis Cultivation Expert"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Professional Bio *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  rows={6}
                  placeholder="Tell us about your background, experience, and expertise..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">
                  This will be shown on your expert profile. Be detailed and professional.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Years of Experience *
                  </label>
                  <select
                    value={formData.yearsExperience}
                    onChange={(e) => updateFormData('yearsExperience', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    required
                  >
                    <option value={0}>Select years</option>
                    {[...Array(25)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} year{i + 1 > 1 ? 's' : ''}
                      </option>
                    ))}
                    <option value={25}>25+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hourly Rate (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => updateFormData('hourlyRate', parseInt(e.target.value))}
                    min="50"
                    max="500"
                    step="25"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    You'll receive 90% after platform fee. Default: $200/hour
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    LinkedIn Profile (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => updateFormData('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => updateFormData('websiteUrl', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Expertise & Credentials */}
        {step === 2 && (
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-400" />
              Expertise & Credentials
            </h2>
            
            <div className="space-y-8">
              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Areas of Expertise * (Select all that apply)
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {specialtyOptions.map((option) => (
                    <div key={option.value} className="space-y-2">
                      <label
                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          formData.specialties.includes(option.value)
                            ? 'border-indigo-500 bg-indigo-900/20'
                            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(option.value)}
                          onChange={() => toggleSpecialty(option.value)}
                          className="mt-1 w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{option.icon}</span>
                            <div className="font-medium text-white">{option.label}</div>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">{option.description}</div>
                          
                          {/* Show subcategories if selected */}
                          {formData.specialties.includes(option.value) && (
                            <div className="mt-3 pl-4 border-l border-gray-600">
                              <div className="text-xs text-gray-500 mb-2">Specialization Areas:</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {option.subcategories.map((sub) => (
                                  <div key={sub.value} className="text-xs text-gray-400 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      sub.expertiseLevel === 'expert' ? 'bg-red-500' :
                                      sub.expertiseLevel === 'advanced' ? 'bg-orange-500' :
                                      sub.expertiseLevel === 'intermediate' ? 'bg-yellow-500' :
                                      'bg-green-500'
                                    }`}></div>
                                    <span>{sub.label}</span>
                                    <span className="text-gray-500">(${sub.averageRate}/hr)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <div className="text-sm text-blue-300">
                    <div className="font-medium mb-2">Expertise Level Indicators:</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Beginner</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>Intermediate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span>Advanced</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Expert</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Certifications & Credentials *
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Enter certification (e.g., PhD Plant Biology - UC Davis)"
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                      onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                    />
                    <button
                      type="button"
                      onClick={addCertification}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="flex-1 text-white">{cert}</span>
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {formData.certifications.length === 0 && (
                    <p className="text-sm text-gray-400">
                      Add your degrees, certifications, and professional credentials
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Availability */}
        {step === 3 && (
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-400" />
              Availability & Schedule
            </h2>
            
            <div className="space-y-8">
              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => updateFormData('timezone', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                  <option value="America/Denver">Mountain Time (MST/MDT)</option>
                  <option value="America/Chicago">Central Time (CST/CDT)</option>
                  <option value="America/New_York">Eastern Time (EST/EDT)</option>
                  <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                  <option value="Europe/Berlin">Central European Time (CET)</option>
                </select>
              </div>

              {/* Available Days */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Available Days * (Select all that apply)
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {dayNames.map((dayName, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`p-3 rounded-lg text-center font-medium transition-all ${
                        formData.availableDays.includes(index)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {dayName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Available Hours *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.availableHours.start}
                      onChange={(e) => updateFormData('availableHours', {
                        ...formData.availableHours,
                        start: e.target.value
                      })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">End Time</label>
                    <input
                      type="time"
                      value={formData.availableHours.end}
                      onChange={(e) => updateFormData('availableHours', {
                        ...formData.availableHours,
                        end: e.target.value
                      })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  These are your general availability hours. You can set specific availability later.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Motivation & References */}
        {step === 4 && (
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-indigo-400" />
              Why Join VibeLux?
            </h2>
            
            <div className="space-y-8">
              {/* Motivation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Why do you want to join the VibeLux expert platform? *
                </label>
                <textarea
                  value={formData.whyJoin}
                  onChange={(e) => updateFormData('whyJoin', e.target.value)}
                  rows={6}
                  placeholder="Tell us about your motivation to join our platform, what value you can provide to clients, and your consulting philosophy..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* References */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Professional References (Optional)
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newReference}
                      onChange={(e) => setNewReference(e.target.value)}
                      placeholder="Name, Title, Company, Email/Phone"
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                      onKeyPress={(e) => e.key === 'Enter' && addReference()}
                    />
                    <button
                      type="button"
                      onClick={addReference}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  
                  {formData.references.map((ref, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="flex-1 text-white">{ref}</span>
                      <button
                        type="button"
                        onClick={() => removeReference(index)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Benefits */}
              <div className="bg-indigo-900/20 border border-indigo-600/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  Platform Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Secure payment processing with escrow protection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Built-in video conferencing and recording</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Automated scheduling and calendar management</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Profile management and client reviews</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Dispute resolution and quality assurance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Marketing and client acquisition support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {submitError && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-400">Application Error</h4>
              <p className="text-red-300">{submitError}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(step)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              Next
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!validateStep(4) || isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}