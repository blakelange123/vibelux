'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle,
  Clock,
  Mail,
  ArrowRight,
  Shield,
  Award,
  Users,
  MessageSquare
} from 'lucide-react';

export default function ExpertApplicationSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-950 pt-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Application Submitted Successfully!
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Thank you for your interest in joining the VibeLux expert platform. 
            We've received your application and will review it within 2-3 business days.
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-400" />
            What Happens Next?
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Application Review</h3>
                <p className="text-gray-400">
                  Our team will review your qualifications, experience, and expertise areas within 2-3 business days.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Verification Process</h3>
                <p className="text-gray-400">
                  We may contact your references and verify your certifications to ensure platform quality.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Profile Setup</h3>
                <p className="text-gray-400">
                  Once approved, we'll help you complete your expert profile and set up your consultation schedule.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                4
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Start Earning</h3>
                <p className="text-gray-400">
                  Begin accepting consultation bookings and sharing your expertise with growers worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-400" />
            Stay Connected
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Email Updates</h3>
              <p className="text-gray-400">
                We'll send you email updates about your application status and next steps.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">Questions?</h3>
              <p className="text-gray-400">
                Contact our expert success team at{' '}
                <a href="mailto:experts@vibelux.com" className="text-indigo-400 hover:text-indigo-300">
                  experts@vibelux.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Platform Benefits Reminder */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-600/30 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-400" />
            Platform Benefits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Secure Payments</h3>
                <p className="text-gray-400">Escrow protection and guaranteed payment for completed consultations.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Quality Clients</h3>
                <p className="text-gray-400">Connect with serious growers and established businesses.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MessageSquare className="w-6 h-6 text-purple-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Built-in Tools</h3>
                <p className="text-gray-400">Video calls, scheduling, and session recording included.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Professional Profile</h3>
                <p className="text-gray-400">Showcase your expertise and build your reputation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/experts"
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Browse Expert Profiles
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>

        {/* Application Reference */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Application submitted on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}