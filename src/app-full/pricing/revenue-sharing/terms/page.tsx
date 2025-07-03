'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, Shield, Scale, AlertCircle, 
  CheckCircle, Clock, DollarSign, BarChart3
} from 'lucide-react';
import PricingNavigation from '@/components/PricingNavigation';

export default function RevenueSharingTermsPage() {
  return (
    <div className="min-h-screen bg-black">
      <PricingNavigation />
      
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">
                Revenue Sharing Terms & Conditions
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-cyan-400 bg-clip-text text-transparent">
              Transparent Terms, Fair Partnership
            </h1>
            
            <p className="text-xl text-gray-400 leading-relaxed">
              Everything you need to know about our revenue-sharing agreements, 
              measurement methods, and mutual commitments.
            </p>
          </div>
        </div>
      </section>

      {/* Key Terms */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Key Contract Terms
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-xl p-6">
              <Clock className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Contract Duration</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Minimum 12-month commitment</li>
                <li>• Multi-year options: 2, 3, or 5 years</li>
                <li>• 90-day notice for renewal/termination</li>
                <li>• Automatic renewal unless cancelled</li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-xl p-6">
              <BarChart3 className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Measurement Methods</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Third-party meter verification</li>
                <li>• Monthly reconciliation reports</li>
                <li>• API integration for real-time data</li>
                <li>• Quarterly performance reviews</li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-xl p-6">
              <DollarSign className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Payment Terms</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Monthly billing in arrears</li>
                <li>• Net 30 payment terms</li>
                <li>• ACH/wire transfer accepted</li>
                <li>• No hidden fees or charges</li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-xl p-6">
              <Shield className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Performance Guarantees</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• No performance fee without savings</li>
                <li>• Minimum savings thresholds apply</li>
                <li>• Monthly caps on total fees</li>
                <li>• SLA: 99.9% platform uptime</li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-xl p-6">
              <Scale className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Dispute Resolution</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• 30-day good faith negotiation</li>
                <li>• Binding arbitration if needed</li>
                <li>• Shared arbitration costs</li>
                <li>• Venue: Delaware, USA</li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-xl p-6">
              <AlertCircle className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Early Termination</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• 25% of projected savings fee</li>
                <li>• Waived for cause (non-performance)</li>
                <li>• Pro-rated multi-year discounts</li>
                <li>• 60-day wind-down period</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Baseline & Measurement */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            How We Measure Success
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-6 text-white">
                Baseline Establishment
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Historical Data Analysis</h4>
                    <p className="text-sm text-gray-400">
                      12-month historical average for energy costs, yields, and operational metrics
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Weather Normalization</h4>
                    <p className="text-sm text-gray-400">
                      Adjustments for seasonal variations and extreme weather events
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Third-Party Verification</h4>
                    <p className="text-sm text-gray-400">
                      Independent audit of baseline metrics by certified professionals
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-6 text-white">
                Ongoing Measurement
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Real-Time Monitoring</h4>
                    <p className="text-sm text-gray-400">
                      Continuous tracking via IoT sensors and utility APIs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Monthly Reconciliation</h4>
                    <p className="text-sm text-gray-400">
                      Detailed reports showing calculations and savings attribution
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Audit Rights</h4>
                    <p className="text-sm text-gray-400">
                      Annual right to audit calculations with 30-day notice
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Protections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Your Legal Protections
          </h2>

          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-600/30">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Data & Privacy</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Your data remains your property</li>
                  <li>✓ Export data anytime</li>
                  <li>✓ SOC 2 Type II compliance</li>
                  <li>✓ No sharing without consent</li>
                  <li>✓ Right to deletion</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Performance Standards</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Clear performance metrics</li>
                  <li>✓ Force majeure protections</li>
                  <li>✓ No liability for crop failures</li>
                  <li>✓ Insurance requirements</li>
                  <li>✓ Indemnification clauses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Contract */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Ready to Review?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Download our sample revenue-sharing agreement to review with your team
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-purple-700 transition-colors">
              <FileText className="w-5 h-5" />
              Download Sample Contract
            </button>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Speak with Legal Team
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Common Legal Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2 text-white">
                What happens if I don't achieve the minimum savings threshold?
              </h3>
              <p className="text-gray-400">
                You only pay the base monthly fee. Performance fees are only charged when 
                your savings exceed the minimum threshold specified in your agreement.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2 text-white">
                Can I switch between traditional and revenue-sharing pricing?
              </h3>
              <p className="text-gray-400">
                Yes, you can switch pricing models at your contract renewal date. 
                Mid-contract switches may be available with mutual agreement and 
                potential adjustment fees.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2 text-white">
                How are disputes about savings calculations resolved?
              </h3>
              <p className="text-gray-400">
                First through good-faith negotiation, then independent third-party 
                verification, and finally through binding arbitration if necessary. 
                Costs are shared equally unless one party is found to be at fault.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2 text-white">
                What happens to my data if I terminate the contract?
              </h3>
              <p className="text-gray-400">
                You have 90 days to export all your data. We'll provide it in standard 
                formats (CSV, JSON, PDF). After 90 days, data is securely deleted unless 
                you request extended retention.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}