'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Mail, ArrowLeft, CheckCircle, AlertCircle,
  Loader2, KeyRound, ShieldCheck
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to send reset email');
      }

      setSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Check Your Email</h1>
            <p className="text-gray-400 mb-8">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>
            </p>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10 mb-8">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Next Steps:</h3>
              <ol className="text-left space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">1.</span>
                  Check your email inbox (and spam folder)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">2.</span>
                  Click the reset link in the email
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">3.</span>
                  Create a new secure password
                </li>
              </ol>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="w-full px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                Send Another Email
              </button>
              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 text-center"
              >
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Vibelux</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to login
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Forgot your password?</h1>
            <p className="text-gray-400">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="you@company.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                  <Mail className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Additional Options */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-center text-gray-400 mb-4">
              Remember your password?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Sign in
              </Link>
            </p>
            <p className="text-center text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 items-center justify-center px-12">
        <div className="max-w-lg">
          <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-8">
            <KeyRound className="w-8 h-8 text-purple-400" />
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Secure Password Recovery
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Email Verification</h3>
                <p className="text-gray-400 text-sm">We'll send a secure link to your registered email address</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">One-Time Link</h3>
                <p className="text-gray-400 text-sm">The reset link expires in 24 hours for your security</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Strong Password</h3>
                <p className="text-gray-400 text-sm">Create a new password with our security requirements</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-900/50 rounded-xl border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-2">Security Tip</h3>
            <p className="text-sm text-gray-400">
              Use a unique password that you don't use for other accounts. Consider using a password manager 
              to generate and store secure passwords.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}