'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Lock, Mail, ArrowRight, AlertCircle, 
  CheckCircle, Eye, EyeOff, Loader2, Building,
  User, Phone, Check, X
} from 'lucide-react';

interface PasswordStrength {
  score: number;
  feedback: string[];
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: '',
    phone: '',
    role: 'grower',
    agreeToTerms: false,
    subscribeToNewsletter: true
  });

  const checkPasswordStrength = (password: string): PasswordStrength => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (password.length < 8) feedback.push('At least 8 characters');
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) feedback.push('Mixed case letters');
    if (!/\d/.test(password)) feedback.push('At least one number');
    if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Special character');

    return { score, feedback };
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate step 1
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (passwordStrength.score < 3) {
        setError('Please choose a stronger password');
        return;
      }
      setError('');
      setStep(2);
      return;
    }

    // Final submission
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      // Redirect to onboarding
      router.push('/get-started');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return 'bg-red-500';
    if (passwordStrength.score <= 2) return 'bg-orange-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Vibelux</span>
          </Link>
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
            Already have an account? Sign in
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-purple-600' : 'bg-gray-800'} text-white font-medium`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-800'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-purple-600' : 'bg-gray-800'} text-white font-medium`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-400">Account Setup</span>
            <span className="text-sm text-gray-400">Business Details</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {step === 1 ? 'Create your account' : 'Tell us about your business'}
            </h1>
            <p className="text-gray-400">
              {step === 1 
                ? 'Start your journey to smarter growing' 
                : 'This helps us personalize your experience'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                {/* Step 1: Account Setup */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {passwordStrength.score <= 2 ? 'Weak' : passwordStrength.score <= 3 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {passwordStrength.feedback.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            {formData.password.length >= 8 && item.includes('8 characters') ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <X className="w-3 h-3 text-gray-400" />
                            )}
                            <span className={formData.password.length >= 8 && item.includes('8 characters') ? 'text-green-400' : 'text-gray-400'}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Step 2: Business Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                    Company name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Acme Farms Inc."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    I am a...
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'grower', label: 'Grower', description: 'Operating a growing facility' },
                      { value: 'investor', label: 'Investor', description: 'Looking to invest in equipment' },
                      { value: 'other', label: 'Other', description: 'Consultant, vendor, etc.' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                          formData.role === option.value
                            ? 'bg-purple-600/10 border-purple-500'
                            : 'bg-gray-800 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={option.value}
                          checked={formData.role === option.value}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="sr-only"
                        />
                        <span className="font-medium text-white mb-1">{option.label}</span>
                        <span className="text-xs text-gray-400">{option.description}</span>
                        {formData.role === option.value && (
                          <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-purple-400" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Terms and Newsletter */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">
                      I agree to the{' '}
                      <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.subscribeToNewsletter}
                      onChange={(e) => setFormData({ ...formData, subscribeToNewsletter: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">
                      Send me updates about new features and industry insights
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`${step === 1 ? 'w-full' : 'ml-auto'} flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : step === 1 ? (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Create account
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Secure Platform</h3>
            <p className="text-sm text-gray-400">Bank-level security with blockchain verification</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto">
              <Building className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-white">Free to Start</h3>
            <p className="text-sm text-gray-400">No credit card required for basic features</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white">Instant Access</h3>
            <p className="text-sm text-gray-400">Start optimizing your facility immediately</p>
          </div>
        </div>
      </div>
    </div>
  );
}