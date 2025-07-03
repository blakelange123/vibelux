'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Mail, CheckCircle, AlertCircle, 
  Sparkles, Lock, ShieldCheck, Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate email
      if (!email) {
        throw new Error('Please enter your email address');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would call Clerk's password reset API
      // await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-2">Check Your Email</h2>
            <p className="text-gray-400 text-center mb-6">
              We've sent password reset instructions to:
            </p>
            
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <p className="text-white font-medium text-center break-all">{email}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300">The link will expire in 1 hour</p>
                  <p className="text-xs text-gray-500">For security reasons</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300">Didn't receive the email?</p>
                  <p className="text-xs text-gray-500">Check your spam folder or try again</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="w-full px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors mb-4"
            >
              Try Another Email
            </button>

            <Link
              href="/sign-in"
              className="block text-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link 
              href="/sign-in"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Sign In
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-md mx-auto px-6 py-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-400">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-6 bg-gray-900/30 rounded-xl border border-white/10">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Password Security Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Use a unique password for each account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Include numbers, symbols, and mixed case letters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Consider using a password manager</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Enable two-factor authentication when available</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400">
            Remember your password? 
            <Link href="/sign-in" className="text-purple-400 hover:text-purple-300 ml-1">
              Sign in instead
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}