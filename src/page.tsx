"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  ArrowRight, 
  BarChart3,
  Brain,
  Building,
  Check,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Leaf,
  Menu,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap
} from 'lucide-react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 w-full overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/95 backdrop-blur-xl shadow-2xl' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-12">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">VibeLux</span>
              </Link>
              
              <div className="hidden lg:flex items-center gap-8">
                {/* Solutions Dropdown */}
                <div className="relative group">
                  <button className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-1">
                    Solutions
                    <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                  </button>
                  
                  {/* Mega Menu Dropdown */}
                  <div className="absolute top-full left-0 mt-2 w-[800px] bg-gray-900 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-6">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Core Platform */}
                      <div>
                        <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Core Platform
                        </h3>
                        <div className="space-y-2">
                          <Link href="/dashboard" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Growing Operations Intelligence
                          </Link>
                          <Link href="/energy" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Energy Management & Optimization
                          </Link>
                          <Link href="/research-library" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Research & Analytics Platform
                          </Link>
                          <Link href="/equipment-board" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Equipment Investment Platform
                          </Link>
                          <Link href="/marketplace" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Marketplace & Trading
                          </Link>
                        </div>
                      </div>
                      
                      {/* Professional Tools */}
                      <div>
                        <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                          <Leaf className="w-4 h-4" />
                          Professional Tools
                        </h3>
                        <div className="space-y-2">
                          <Link href="/calculators" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            🍅 Advanced Dutch Research Suite
                          </Link>
                          <Link href="/calculators/environmental" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Professional Calculators (25+)
                          </Link>
                          <Link href="/design" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            AI-Powered Design Studio
                          </Link>
                          <Link href="/professional-reporting" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Advanced Reporting & Analytics
                          </Link>
                          <Link href="/sensors/devices" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            IoT & Sensor Integration
                          </Link>
                        </div>
                      </div>
                      
                      {/* Business Intelligence */}
                      <div>
                        <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Business Intelligence
                        </h3>
                        <div className="space-y-2">
                          <Link href="/financial-planning" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Financial Planning & ROI
                          </Link>
                          <Link href="/predictive-maintenance" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Predictive Maintenance AI
                          </Link>
                          <Link href="/compliance" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Compliance & Risk Management
                          </Link>
                          <Link href="/multi-site" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Multi-Site Management
                          </Link>
                          <Link href="/performance" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Performance Analytics
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom CTA */}
                    <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Building className="w-4 h-4" />
                        <span>15+ Solution Categories • 25+ Calculators • 130M+ Research Papers</span>
                      </div>
                      <Link href="/features" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
                        View All Features
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
                
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Pricing
                </Link>
                <Link href="/features" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Features
                </Link>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors font-medium">
                  About
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/sign-in" className="hidden lg:block text-gray-300 hover:text-white transition-colors font-medium">
                Sign In
              </Link>
              <Link href="/sign-up" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                Get Started
              </Link>
              
              <button 
                className="lg:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-gray-900 border-t border-gray-800">
              <div className="px-6 py-4 space-y-3">
                <Link href="/dashboard" className="block text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/energy" className="block text-gray-300 hover:text-white transition-colors">
                  Energy
                </Link>
                <Link href="/sensors" className="block text-gray-300 hover:text-white transition-colors">
                  Sensors
                </Link>
                <Link href="/marketplace" className="block text-gray-300 hover:text-white transition-colors">
                  Marketplace
                </Link>
                <Link href="/sign-in" className="block text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                The Future of
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                  {" "}Cannabis Cultivation
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                AI-powered cultivation optimization, energy management, and compliance automation 
                for modern cannabis facilities. Reduce costs, increase yields, ensure compliance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/presentation/nsave" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                View Presentation
              </Link>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">15-30%</div>
                <div className="text-gray-400">Energy Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">$20K-80K</div>
                <div className="text-gray-400">Annual Savings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">$0</div>
                <div className="text-gray-400">Upfront Investment</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-white">Complete Cultivation Platform</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to optimize your cannabis cultivation operation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Energy Management */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Energy Optimization</h3>
              <p className="text-gray-400 mb-6">
                AI-powered HVAC control, demand response, and utility rebate management. 
                Reduce energy costs by 15-30%.
              </p>
              <Link href="/energy" className="text-yellow-400 hover:text-yellow-300 font-medium flex items-center gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Growing Operations */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Leaf className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Smart Cultivation</h3>
              <p className="text-gray-400 mb-6">
                Environmental monitoring, growth tracking, and compliance automation. 
                Optimize yields and ensure regulatory compliance.
              </p>
              <Link href="/dashboard" className="text-green-400 hover:text-green-300 font-medium flex items-center gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Arduino Integration */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Hardware Agnostic</h3>
              <p className="text-gray-400 mb-6">
                Connect any Arduino, ESP32, or sensor. Cost-effective monitoring 
                with professional analytics.
              </p>
              <Link href="/sensors/devices" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2">
                Add Sensors <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Growing as a Service */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <Building className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Growing as a Service</h3>
              <p className="text-gray-400 mb-6">
                Zero upfront investment. Pay from energy savings. 
                Complete technology platform with expert support.
              </p>
              <Link href="/presentation/nsave" className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Analytics */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI Analytics</h3>
              <p className="text-gray-400 mb-6">
                Quantum optimization algorithms, predictive analytics, 
                and automated decision making.
              </p>
              <Link href="/dashboard" className="text-orange-400 hover:text-orange-300 font-medium flex items-center gap-2">
                View Analytics <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Marketplace */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Marketplace</h3>
              <p className="text-gray-400 mb-6">
                Connect with buyers, manage sales, and optimize 
                your supply chain operations.
              </p>
              <Link href="/marketplace" className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-2">
                Explore Market <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">
              Ready to Transform Your Cultivation Operation?
            </h2>
            <p className="text-xl text-gray-400">
              Join leading cannabis facilities using VibeLux to optimize energy, 
              increase yields, and ensure compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                Start Free Trial
              </Link>
              <Link href="/presentation/nsave" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                View Partnership Deck
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">VibeLux</span>
              </div>
              <p className="text-gray-400 text-sm">
                The future of cannabis cultivation technology.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Platform</h4>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Dashboard
                </Link>
                <Link href="/energy" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Energy Management
                </Link>
                <Link href="/sensors" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Sensor Integration
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Solutions</h4>
              <div className="space-y-2">
                <Link href="/sensors/devices" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Arduino Integration
                </Link>
                <Link href="/marketplace" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Marketplace
                </Link>
                <Link href="/presentation/nsave" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Growing as a Service
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Company</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  About
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
                <Link href="/privacy" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 VibeLux. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}