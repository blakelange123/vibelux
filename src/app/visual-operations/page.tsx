'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Camera, Bug, Wrench, Shield, Eye, Package, CheckCircle, 
  ArrowRight, BarChart3, Zap, Droplets, Sun, ThermometerSun,
  TrendingUp, DollarSign, Clock, Users, MapPin, Smartphone,
  Brain, Target, Activity, AlertTriangle, Award, Star
} from 'lucide-react';

export default function VisualOperationsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const reportTypes = [
    {
      icon: Bug,
      title: 'Pest/Disease Detection',
      description: 'AI detects pests and diseases in 30 seconds with 94% accuracy',
      color: 'text-red-500 bg-red-500/10',
      savings: '$50K-$500K per critical issue caught early',
      features: ['30-second AI analysis', 'Treatment recommendations', 'Spread risk assessment', 'Quarantine alerts']
    },
    {
      icon: Wrench,
      title: 'Equipment Diagnostics',
      description: 'Auto-generate work orders with cost estimates and repair timelines',
      color: 'text-orange-500 bg-orange-500/10',
      savings: '60% reduction in equipment downtime',
      features: ['AI diagnostic analysis', 'Cost estimation', 'Parts ordering', 'Maintenance scheduling']
    },
    {
      icon: Shield,
      title: 'Safety & Compliance',
      description: 'Instant safety hazard detection and automated compliance documentation',
      color: 'text-red-600 bg-red-600/10',
      savings: '75% reduction in safety incidents',
      features: ['Hazard identification', 'Compliance tracking', 'Incident documentation', 'OSHA violation detection']
    },
    {
      icon: Eye,
      title: 'Quality Control',
      description: 'Product quality assessment with compliance risk analysis',
      color: 'text-indigo-500 bg-indigo-500/10',
      savings: '50% reduction in customer complaints',
      features: ['Quality analysis', 'Batch tracking', 'Compliance assessment', 'Corrective actions']
    },
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Low stock alerts and asset condition tracking with photo proof',
      color: 'text-green-500 bg-green-500/10',
      savings: '30% improvement in inventory accuracy',
      features: ['Stock level monitoring', 'Asset tracking', 'Cycle count verification', 'Damage documentation']
    },
    {
      icon: CheckCircle,
      title: 'Task Completion',
      description: 'Before/after photo verification with work quality scoring',
      color: 'text-green-600 bg-green-600/10',
      savings: '67% faster task verification',
      features: ['Photo verification', 'Quality scoring', 'Progress tracking', 'Time documentation']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Vibelux</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/pricing" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link 
                href="/contact" 
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Camera className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                Transform Every Worker Into an Intelligent Sensor
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Visual Operations Intelligence
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered photo analysis that detects issues, verifies tasks, and optimizes facility operations. 
              Turn your mobile workforce into the most advanced monitoring system available.
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                <div className="text-3xl font-bold text-white mb-1">94%</div>
                <div className="text-sm text-gray-400">AI Accuracy</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                <div className="text-3xl font-bold text-white mb-1">30s</div>
                <div className="text-sm text-gray-400">Analysis Time</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                <div className="text-3xl font-bold text-white mb-1">12</div>
                <div className="text-sm text-gray-400">Report Types</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                <div className="text-3xl font-bold text-white mb-1">67%</div>
                <div className="text-sm text-gray-400">Faster Response</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/demo"
                className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-purple-600/30 font-medium text-lg"
              >
                <Camera className="w-5 h-5" />
                Try Live Demo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/pricing"
                className="flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-all duration-300 font-medium text-lg border border-gray-700"
              >
                <DollarSign className="w-5 h-5" />
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Report Types Grid */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              12 Types of Intelligent Photo Reports
            </h2>
            <p className="text-xl text-gray-400">
              Comprehensive facility monitoring with AI-powered analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reportTypes.map((type, index) => (
              <div key={index} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${type.color}`}>
                  <type.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{type.title}</h3>
                <p className="text-gray-400 mb-4">{type.description}</p>
                <div className="text-sm text-green-400 font-medium mb-4">{type.savings}</div>
                <ul className="space-y-2">
                  {type.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              How Visual Operations Works
            </h2>
            <p className="text-xl text-gray-400">
              Simple, powerful, and designed for real-world use
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">1. Quick Photo Capture</h3>
              <p className="text-gray-400">
                Workers take photos using the Visual Operations Hub with one-tap reporting for common issues.
              </p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">2. AI Analysis</h3>
              <p className="text-gray-400">
                Advanced AI analyzes photos in 30 seconds, identifying issues, estimating costs, and recommending actions.
              </p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">3. Automated Action</h3>
              <p className="text-gray-400">
                System automatically generates alerts, creates work orders, and assigns tasks based on urgency and type.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16 bg-gradient-to-br from-green-900/10 to-emerald-900/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-gray-800 rounded-3xl p-8 border border-green-600/30">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Calculate Your ROI
              </h2>
              <p className="text-xl text-gray-300">
                See how Visual Operations Intelligence pays for itself
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">$99</div>
                <div className="text-gray-400">Monthly Cost</div>
                <div className="text-sm text-gray-500">Per facility</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">$12K</div>
                <div className="text-gray-400">Average Annual Savings</div>
                <div className="text-sm text-gray-500">Conservative estimate</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">1,100%</div>
                <div className="text-gray-400">Average ROI</div>
                <div className="text-sm text-gray-500">First year</div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Typical Cost Savings:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Equipment downtime reduction</span>
                    <span className="text-green-400">$8,400/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Early pest/disease detection</span>
                    <span className="text-green-400">$25,000/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Safety incident prevention</span>
                    <span className="text-green-400">$15,000/year</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Quality issue prevention</span>
                    <span className="text-green-400">$12,000/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Compliance automation</span>
                    <span className="text-green-400">$6,000/year</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-3">
                    <span className="text-white font-semibold">Total Annual Savings</span>
                    <span className="text-green-400 font-bold">$66,400/year</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration & Tech Stack */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Enterprise-Grade Technology
            </h2>
            <p className="text-xl text-gray-400">
              Built for reliability, security, and scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">OpenAI Vision API</h3>
              <p className="text-sm text-gray-400">Latest GPT-4 Vision for accurate analysis</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Bank-Level Security</h3>
              <p className="text-sm text-gray-400">End-to-end encryption and compliance</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <Activity className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Real-Time Processing</h3>
              <p className="text-sm text-gray-400">Instant analysis and notifications</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <BarChart3 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Advanced Analytics</h3>
              <p className="text-sm text-gray-400">Comprehensive reporting and insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Success Stories */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-400">
              Real results from real facilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  GF
                </div>
                <div>
                  <h4 className="font-semibold text-white">GreenTech Farms</h4>
                  <p className="text-sm text-gray-400">50,000 sq ft facility</p>
                </div>
              </div>
              <blockquote className="text-gray-300 mb-4">
                "Visual Operations caught a spider mite infestation 2 weeks before we would have noticed. 
                Saved us over $200K in crop losses."
              </blockquote>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Crop Loss Prevented</p>
                  <p className="text-xl font-bold text-green-500">$200K</p>
                </div>
                <div>
                  <p className="text-gray-400">Detection Speed</p>
                  <p className="text-xl font-bold text-purple-500">2 weeks early</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  VH
                </div>
                <div>
                  <h4 className="font-semibold text-white">Vertical Harvest</h4>
                  <p className="text-sm text-gray-400">Indoor vertical farm</p>
                </div>
              </div>
              <blockquote className="text-gray-300 mb-4">
                "Equipment diagnostics identified bearing issues before failure. 
                Prevented 3-day shutdown and $75K in lost production."
              </blockquote>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Downtime Prevented</p>
                  <p className="text-xl font-bold text-green-500">3 days</p>
                </div>
                <div>
                  <p className="text-gray-400">Cost Savings</p>
                  <p className="text-xl font-bold text-purple-500">$75K</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  AG
                </div>
                <div>
                  <h4 className="font-semibold text-white">Alpine Greens</h4>
                  <p className="text-sm text-gray-400">Cannabis cultivation</p>
                </div>
              </div>
              <blockquote className="text-gray-300 mb-4">
                "Safety hazard detection prevented a serious electrical incident. 
                The system more than paid for itself in insurance savings alone."
              </blockquote>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Incidents Prevented</p>
                  <p className="text-xl font-bold text-green-500">12</p>
                </div>
                <div>
                  <p className="text-gray-400">Insurance Savings</p>
                  <p className="text-xl font-bold text-purple-500">$25K</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & CTA */}
      <section className="py-16 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start with our comprehensive Visual Operations Intelligence platform. 
            The first critical issue caught typically pays for the entire year.
          </p>
          
          <div className="bg-gray-800 rounded-2xl p-8 mb-8 border border-purple-600/30">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Visual Operations Tier</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-900 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">$39</div>
                <div className="text-gray-400 mb-2">Essential Visual</div>
                <div className="text-sm text-gray-500">Basic photo reporting</div>
                <div className="text-xs text-gray-600 mt-2">Manual categorization, standard alerts</div>
              </div>
              
              <div className="bg-blue-900/50 rounded-xl p-6 text-center border border-blue-500/50 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  POPULAR
                </div>
                <div className="text-3xl font-bold text-white mb-2">$69</div>
                <div className="text-blue-400 mb-2">Professional Visual</div>
                <div className="text-sm text-gray-300">AI-powered analysis</div>
                <div className="text-xs text-gray-500 mt-2">Auto work orders, predictive insights</div>
              </div>
              
              <div className="bg-purple-900/50 rounded-xl p-6 text-center border border-purple-500/50">
                <div className="text-3xl font-bold text-white mb-2">$99</div>
                <div className="text-purple-400 mb-2">Enterprise Intelligence</div>
                <div className="text-sm text-gray-300">Advanced AI diagnostics</div>
                <div className="text-xs text-gray-500 mt-2">Custom dashboards, unlimited retention</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-white mb-1">30-Day Free Trial Available</div>
              <div className="text-sm text-gray-400">Full features, no commitment required</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/demo"
              className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all duration-300 shadow-xl hover:shadow-purple-600/30 font-medium text-lg"
            >
              <Camera className="w-5 h-5" />
              Try Live Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact"
              className="flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-all duration-300 font-medium text-lg border border-gray-700"
            >
              <Users className="w-5 h-5" />
              Talk to an Expert
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-400">
            No credit card required • 30-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}