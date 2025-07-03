'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Building,
  Clock,
  Award,
  AlertTriangle,
  Package,
  Users,
  FileCheck,
  BarChart3,
  Zap,
  Target,
  ChevronRight,
  Play,
  DollarSign,
  Percent,
  Timer,
  ShoppingCart
} from 'lucide-react';
import { ComplianceDashboard } from '@/components/food-safety/ComplianceDashboard';

const buyerLogos = {
  'US Foods': '/logos/us-foods.png',
  'Whole Foods': '/logos/whole-foods.png',
  'Sysco': '/logos/sysco.png',
  'Kroger': '/logos/kroger.png',
  'Walmart': '/logos/walmart.png',
  'Costco': '/logos/costco.png'
};

export default function FoodSafetyPage() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Mock facility data - in production, get from user context
  const facilityId = 'demo-facility-123';
  const facilityType = 'produce' as const;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {showDashboard ? (
        <ComplianceDashboard facilityId={facilityId} facilityType={facilityType} />
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-700/50" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-4xl mx-auto"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Comprehensive Food Safety Platform
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                  Multi-Buyer Food Safety
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                    {' '}Compliance Made Simple
                  </span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Automated HACCP monitoring, real-time CCP tracking, and seamless compliance 
                  management for US Foods, Whole Foods, Sysco, and all major buyers.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setShowDashboard(true)}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Play className="w-5 h-5" />
                    Launch Compliance Center
                  </button>
                  <Link
                    href="/demo/food-safety"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
                  >
                    See Demo
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">GFSI Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">FSMA Ready</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">FDA Registered</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">21 CFR Part 11</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Value Proposition */}
          <section className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  One Platform, All Your Buyers
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Stop managing multiple spreadsheets and systems. Vibelux consolidates all buyer 
                  requirements into one intelligent compliance platform.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {Object.entries(buyerLogos).map(([buyer, logo]) => (
                  <motion.div
                    key={buyer}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="h-16 flex items-center justify-center mb-3">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-400">
                        {buyer.substring(0, 2)}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {buyer}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ROI Calculator */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl p-12 text-white">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-4xl font-bold mb-6">
                      Calculate Your Compliance ROI
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                      See how much time and money you can save by automating your food safety compliance
                    </p>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Timer className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">40+ hours/month</p>
                          <p className="text-blue-100">Average time saved on compliance tasks</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">$8,500/month</p>
                          <p className="text-blue-100">Average cost savings per facility</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Percent className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">100% audit pass rate</p>
                          <p className="text-blue-100">With automated compliance tracking</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                    <h3 className="text-2xl font-semibold mb-6">Quick ROI Calculator</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Buyers</label>
                        <input
                          type="number"
                          defaultValue="3"
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Monthly Compliance Hours</label>
                        <input
                          type="number"
                          defaultValue="60"
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Average Hourly Cost</label>
                        <input
                          type="number"
                          defaultValue="75"
                          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                        />
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-white/20 rounded-lg">
                      <p className="text-sm mb-2">Estimated Monthly Savings:</p>
                      <p className="text-3xl font-bold">$3,375</p>
                      <p className="text-sm mt-1 text-blue-100">ROI in less than 2 months</p>
                    </div>

                    <button className="w-full mt-6 px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                      Get Detailed ROI Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Features */}
          <section className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Complete Food Safety Management
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Everything you need to maintain compliance and ensure food safety
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: Shield,
                    title: 'HACCP Plan Builder',
                    description: 'Create and maintain FSMA-compliant food safety plans with guided workflows',
                    features: ['Hazard analysis', 'CCP identification', 'Preventive controls', 'Validation tools']
                  },
                  {
                    icon: AlertTriangle,
                    title: 'Real-time CCP Monitoring',
                    description: 'Automated monitoring with IoT sensors and instant deviation alerts',
                    features: ['Sensor integration', 'Auto-logging', 'Deviation alerts', 'Corrective actions']
                  },
                  {
                    icon: Package,
                    title: 'Mock Recall System',
                    description: 'Complete traceability with 4-hour recall capability',
                    features: ['One-up, one-back', 'Lot tracking', 'Mock recall drills', 'FDA reporting']
                  },
                  {
                    icon: FileCheck,
                    title: 'Document Control',
                    description: 'Version-controlled repository for all compliance documents',
                    features: ['Auto-expiration', 'Audit trail', 'Secure sharing', 'Template library']
                  },
                  {
                    icon: Users,
                    title: 'Training Management',
                    description: 'Track employee training and maintain competency records',
                    features: ['Training matrix', 'Auto-reminders', 'Digital certificates', 'Skill tracking']
                  },
                  {
                    icon: Award,
                    title: 'Multi-Buyer Compliance',
                    description: 'Manage requirements for all your buyers in one place',
                    features: ['Buyer profiles', 'Requirement mapping', 'Status tracking', 'Audit packages']
                  }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {feature.features.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Success Metrics */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gray-900 dark:bg-gray-800 rounded-3xl p-12 text-white">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    Proven Results for Food Producers
                  </h2>
                  <p className="text-lg text-gray-300">
                    Join hundreds of facilities achieving compliance excellence
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-8">
                  {[
                    { metric: '100%', label: 'Audit Pass Rate', sublabel: 'First attempt' },
                    { metric: '4 hrs', label: 'Mock Recall Time', sublabel: 'vs 24hr industry avg' },
                    { metric: '75%', label: 'Time Savings', sublabel: 'On compliance tasks' },
                    { metric: '$125K', label: 'Annual Savings', sublabel: 'Per facility average' }
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-4xl font-bold text-blue-400 mb-2">{stat.metric}</div>
                      <p className="text-lg font-medium mb-1">{stat.label}</p>
                      <p className="text-sm text-gray-400">{stat.sublabel}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl">
                  <p className="text-lg text-center mb-4">
                    "Vibelux transformed our food safety compliance. We went from spending 60+ hours 
                    per month on paperwork to having real-time visibility into all our CCPs and 
                    automatic compliance for our 5 major buyers."
                  </p>
                  <p className="text-center text-gray-300">
                    - Sarah Chen, QA Director, FreshGreens Vertical Farm
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Automate Your Food Safety Compliance?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Start your free trial and see immediate improvements in compliance efficiency
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowDashboard(true)}
                  className="px-8 py-4 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105"
                >
                  Start Free Trial
                </button>
                <Link
                  href="/contact/sales"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-medium rounded-xl hover:bg-white/10 transition-all"
                >
                  Talk to Sales
                </Link>
              </div>
              <p className="mt-6 text-sm text-blue-100">
                No credit card required • 30-day free trial • Full feature access
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}