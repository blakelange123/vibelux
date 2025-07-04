'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Users, 
  Shield, 
  Clock,
  CheckCircle,
  BarChart3,
  Brain,
  Database,
  Calculator,
  Leaf,
  Sun,
  Droplets,
  Thermometer,
  TrendingUp,
  Activity,
  Calendar,
  Map,
  Package,
  Beaker,
  Palette,
  FileText,
  Cloud,
  GitBranch,
  Settings,
  Play
} from 'lucide-react'

export default function UpdatedHomePage() {
  const [activeFeature, setActiveFeature] = useState(0)

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      title: "Advanced Lighting Designer",
      description: "Professional-grade PPFD mapping with false color visualization",
      icon: Sun,
      image: "/api/placeholder/600/400",
      points: [
        "Real-time PPFD & DLI calculations",
        "Multi-layer canopy support",
        "3D room visualization",
        "Drag-and-drop fixture placement"
      ]
    },
    {
      title: "Complete DLC Database",
      description: "Access 2,400+ qualified fixtures with advanced filtering",
      icon: Database,
      image: "/api/placeholder/600/400",
      points: [
        "Daily updated fixture data",
        "Advanced spectrum filtering",
        "Side-by-side comparisons",
        "IES file downloads"
      ]
    },
    {
      title: "AI-Powered Intelligence",
      description: "GPT-4 powered assistant for optimal growing conditions",
      icon: Brain,
      image: "/api/placeholder/600/400",
      points: [
        "Plant health diagnosis",
        "Custom spectrum recommendations",
        "Yield predictions",
        "24/7 expert support"
      ]
    },
    {
      title: "Nutrient & Water Management",
      description: "Complete fertigation and irrigation planning",
      icon: Droplets,
      image: "/api/placeholder/600/400",
      points: [
        "Custom recipe creation",
        "EC/pH optimization",
        "Water usage tracking",
        "Argus integration"
      ]
    }
  ]

  const allFeatures = [
    // Design & Planning
    { icon: Sun, label: "PPFD/DLI Calculator", category: "design" },
    { icon: Map, label: "False Color Mapping", category: "design" },
    { icon: Package, label: "3D Visualization", category: "design" },
    { icon: GitBranch, label: "Multi-Layer Design", category: "design" },
    
    // Analysis & Optimization
    { icon: BarChart3, label: "Spectrum Analysis", category: "analysis" },
    { icon: TrendingUp, label: "Yield Prediction", category: "analysis" },
    { icon: Activity, label: "Energy Monitoring", category: "analysis" },
    { icon: Thermometer, label: "Heat Load Calculator", category: "analysis" },
    
    // Environmental
    { icon: Cloud, label: "Weather Integration", category: "environment" },
    { icon: Leaf, label: "VPD Calculator", category: "environment" },
    { icon: Calendar, label: "Photoperiod Scheduler", category: "environment" },
    { icon: Palette, label: "Custom Spectrum Designer", category: "environment" },
    
    // Business Tools
    { icon: Calculator, label: "ROI Calculator", category: "business" },
    { icon: FileText, label: "Professional Reports", category: "business" },
    { icon: Zap, label: "Rebate Calculator", category: "business" },
    { icon: Shield, label: "Carbon Credits", category: "business" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Apple-style gradient */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
        
        {/* Navigation */}
        <nav className="relative z-10 px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-12">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Vibelux
              </h1>
              <div className="hidden md:flex items-center gap-8">
                <Link href="/features" className="text-gray-700 hover:text-purple-600 transition-colors">Features</Link>
                <Link href="/fixtures" className="text-gray-700 hover:text-purple-600 transition-colors">Fixtures</Link>
                <Link href="/pricing" className="text-gray-700 hover:text-purple-600 transition-colors">Pricing</Link>
                <Link href="/resources" className="text-gray-700 hover:text-purple-600 transition-colors">Resources</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in" className="text-gray-700 hover:text-purple-600 transition-colors">Sign In</Link>
              <Link 
                href="/dashboard" 
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-8 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              New: AI-Powered Spectrum Optimization
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">The Complete</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Horticultural Lighting
              </span>
              <br />
              <span className="text-gray-900">Platform</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              From PPFD calculations to nutrient management, Vibelux provides everything you need 
              to design, optimize, and manage professional growing operations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard" 
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold text-lg hover:shadow-xl transition-all inline-flex items-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg border border-gray-300 hover:border-gray-400 transition-all inline-flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                14-day free trial
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Showcase */}
      <section className="py-24 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600">
              Professional tools trusted by 10,000+ growers worldwide
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Tabs */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all ${
                    activeFeature === index
                      ? 'bg-white shadow-xl border-2 border-purple-500'
                      : 'bg-white/50 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      activeFeature === index
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600'
                        : 'bg-gray-100'
                    }`}>
                      <feature.icon className={`w-6 h-6 ${
                        activeFeature === index ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                      {activeFeature === index && (
                        <ul className="mt-4 space-y-2">
                          {feature.points.map((point, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Visual */}
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <features[activeFeature].icon className="w-24 h-24 text-purple-600 mb-4" />
                    <p className="text-lg font-medium text-gray-700">
                      {features[activeFeature].title}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl blur-2xl opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Features Grid */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              40+ Professional Features
            </h2>
            <p className="text-xl text-gray-600">
              The most comprehensive horticultural lighting toolkit available
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {allFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all group"
              >
                <feature.icon className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">2,400+</div>
              <div className="text-purple-100">DLC Fixtures</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">10,000+</div>
              <div className="text-purple-100">Active Users</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-purple-100">Uptime SLA</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-purple-100">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Optimize Your Growing Operation?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of professionals using Vibelux to design better, grow smarter, and maximize yields.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold text-lg hover:shadow-xl transition-all inline-flex items-center gap-2 group"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/pricing" 
              className="px-8 py-4 bg-gray-100 text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}