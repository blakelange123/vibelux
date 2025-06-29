"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  ArrowRight, 
  BarChart3,
  Battery,
  Brain,
  Briefcase,
  Building,
  Bug,
  Camera,
  Check,
  CheckCircle,
  ChevronRight,
  CircuitBoard,
  DollarSign,
  Droplets,
  Eye,
  FlaskConical,
  Flower2,
  Globe,
  GraduationCap,
  HeartHandshake,
  Layers,
  Leaf,
  Menu,
  Network,
  Package,
  Rocket,
  Shield,
  Sparkles,
  Sprout,
  Store,
  Sun,
  ThermometerSun,
  TrendingUp,
  Users,
  Wrench,
  X,
  Zap
} from 'lucide-react'
export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Simulate content loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 w-full overflow-x-hidden">
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-gray-950/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-purple-600/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-xl text-gray-400 font-medium">Loading Vibelux...</div>
          </div>
        </div>
      )}
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
                <span className="text-xl font-bold text-white">Vibelux</span>
              </Link>
              
              <div className="hidden lg:flex items-center gap-8">
                {/* Solutions Dropdown */}
                <div className="relative group">
                  <button className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-1">
                    Solutions
                    <ChevronRight className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/growing" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-t-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Leaf className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium">Growing Operations</div>
                          <div className="text-xs text-gray-500">Optimize your cultivation</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/energy" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <div>
                          <div className="font-medium">Energy Management</div>
                          <div className="text-xs text-gray-500">Reduce costs & earn revenue</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/research-library" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <FlaskConical className="w-5 h-5 text-purple-500" />
                        <div>
                          <div className="font-medium">Research Library</div>
                          <div className="text-xs text-gray-500">7 repositories, 130M+ papers</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/marketplace" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-b-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Marketplace</div>
                          <div className="text-xs text-gray-500">Buy & sell produce</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Platform Dropdown */}
                <div className="relative group">
                  <button className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-1">
                    Platform
                    <ChevronRight className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/features" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-t-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        <div>
                          <div className="font-medium">All Features</div>
                          <div className="text-xs text-gray-500">Complete overview</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/integrations" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <CircuitBoard className="w-5 h-5 text-cyan-500" />
                        <div>
                          <div className="font-medium">IoT & Integrations</div>
                          <div className="text-xs text-gray-500">Sensors & utilities</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/integrations" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <Network className="w-5 h-5 text-orange-500" />
                        <div>
                          <div className="font-medium">Integrations</div>
                          <div className="text-xs text-gray-500">BMS, IoT & APIs</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/tracking" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-indigo-500" />
                        <div>
                          <div className="font-medium">Asset Tracking</div>
                          <div className="text-xs text-gray-500">QR & BLE tracking</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/visual-operations" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <Camera className="w-5 h-5 text-purple-500" />
                        <div>
                          <div className="font-medium">Visual Operations</div>
                          <div className="text-xs text-gray-500">AI photo intelligence</div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/admin" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-b-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-red-500" />
                        <div>
                          <div className="font-medium">Admin Portal</div>
                          <div className="text-xs text-gray-500">Operations center</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                <Link href="/equipment-board" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Equipment Board
                </Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Pricing
                </Link>
                <Link href="/resources" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Resources
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="hidden lg:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-purple-600/30 font-medium"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Vibelux</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-88px)]">
              {/* Solutions Section */}
              <div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Solutions</div>
                <div className="space-y-3">
                  <Link 
                    href="/growing" 
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Leaf className="w-5 h-5 text-green-500" />
                    <span>Growing Operations</span>
                  </Link>
                  <Link 
                    href="/energy" 
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span>Energy Management</span>
                  </Link>
                  <Link 
                    href="/research-library" 
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FlaskConical className="w-5 h-5 text-purple-500" />
                    <span>Research Library</span>
                  </Link>
                  <Link 
                    href="/marketplace" 
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Store className="w-5 h-5 text-blue-500" />
                    <span>Marketplace</span>
                  </Link>
                </div>
              </div>

              {/* Platform Section */}
              <div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Platform</div>
                <div className="space-y-3">
                  <Link 
                    href="/features" 
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <span>All Features</span>
                  </Link>
                  <Link 
                    href="/integrations" 
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <CircuitBoard className="w-5 h-5 text-cyan-500" />
                    <span>IoT & Integrations</span>
                  </Link>
                  <Link 
                    href="/integrations" 
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Network className="w-5 h-5 text-orange-500" />
                    <span>Integrations</span>
                  </Link>
                  <Link 
                    href="/tracking" 
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="w-5 h-5 text-indigo-500" />
                    <span>Asset Tracking</span>
                  </Link>
                  <Link 
                    href="/visual-operations" 
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Camera className="w-5 h-5 text-purple-500" />
                    <span>Visual Operations</span>
                  </Link>
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="w-5 h-5 text-red-500" />
                    <span>Admin Portal</span>
                  </Link>
                </div>
              </div>

              {/* Other Links */}
              <div className="space-y-3 pt-3 border-t border-gray-800">
                <Link 
                  href="/equipment-board" 
                  className="block text-gray-300 hover:text-white transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Equipment Board
                </Link>
                <Link 
                  href="/pricing" 
                  className="block text-gray-300 hover:text-white transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  href="/resources" 
                  className="block text-gray-300 hover:text-white transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Resources
                </Link>
              </div>

              {/* Auth Buttons */}
              <div className="space-y-3 pt-6 border-t border-gray-800">
                <Link 
                  href="/login" 
                  className="block w-full text-center px-6 py-3 text-gray-300 hover:text-white border border-gray-700 rounded-full transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-purple-600/30 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {isLoading ? (
          // Hero Skeleton
          <div className="relative max-w-8xl mx-auto px-8 lg:px-12 py-20 lg:py-32 w-full">
            <div className="text-center max-w-6xl mx-auto w-full">
              {/* Badge skeleton */}
              <div className="flex items-center justify-center mb-8">
                <div className="w-64 h-10 bg-gray-800 rounded-full animate-pulse"></div>
              </div>
              
              {/* Title skeleton */}
              <div className="space-y-4 mb-8">
                <div className="w-3/4 h-16 bg-gray-800 rounded-lg animate-pulse mx-auto"></div>
                <div className="w-full h-16 bg-gray-800 rounded-lg animate-pulse"></div>
              </div>
              
              {/* Description skeleton */}
              <div className="space-y-3 mb-12 max-w-5xl mx-auto">
                <div className="w-full h-8 bg-gray-800 rounded-lg animate-pulse"></div>
                <div className="w-5/6 h-8 bg-gray-800 rounded-lg animate-pulse mx-auto"></div>
              </div>
              
              {/* CTA buttons skeleton */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                <div className="w-48 h-14 bg-gray-800 rounded-full animate-pulse"></div>
                <div className="w-48 h-14 bg-gray-800 rounded-full animate-pulse"></div>
              </div>
              
              {/* Stats skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <div className="w-24 h-12 bg-gray-800 rounded-lg animate-pulse mx-auto mb-2"></div>
                    <div className="w-32 h-6 bg-gray-800 rounded-lg animate-pulse mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-green-900/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-600/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>
        
        <div className="relative max-w-8xl mx-auto px-8 lg:px-12 py-20 lg:py-32 w-full">
          <div className="text-center max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full text-base font-medium">
                <Leaf className="w-5 h-5 mr-2" />
                CEA as a Service + AI-Powered Intelligence
              </div>
            </div>
            
            <h1 className="text-6xl lg:text-8xl xl:text-9xl font-bold text-white mb-8 leading-tight">
              Growing Made Simple.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 animate-gradient">
                Everything Included.
              </span>
            </h1>
            
            <p className="text-2xl lg:text-3xl text-gray-300 mb-12 max-w-5xl mx-auto leading-relaxed">
              Get everything you need to grow successfully - equipment, software, and support. <span className="text-green-400 font-semibold">Pay only based on your actual results</span>. 
              No loans, no debt, just shared success.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Link 
                href="/get-started"
                className="flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full transition-all duration-300 shadow-xl hover:shadow-green-600/30 font-semibold text-xl"
              >
                <Rocket className="w-6 h-6" />
                See How It Works
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link 
                href="/how-it-works"
                className="flex items-center gap-3 px-12 py-5 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-all duration-300 font-semibold text-xl border border-gray-700"
              >
                <Network className="w-6 h-6" />
                How It Works
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">Equipment</div>
                <div className="text-base text-gray-400">Provided</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">Software</div>
                <div className="text-base text-gray-400">Included</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">Support</div>
                <div className="text-base text-gray-400">24/7 Available</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-green-400 mb-2">Success</div>
                <div className="text-base text-gray-400">Shared</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-gray-400 rotate-90" />
        </div>
        </>
        )}
      </section>

      {/* CEA as a Service CTA */}
      <section className="py-16 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-y border-green-800/30">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-green-500" />
            <h2 className="text-3xl font-bold text-white">CEA as a Service</h2>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Everything you need to grow successfully - <span className="text-green-400 font-semibold">equipment, software, and support</span>. 
            We succeed when you succeed. No upfront costs, no loans, just shared success.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="text-2xl font-bold text-green-400 mb-1">Complete</div>
              <div className="text-sm text-gray-400">Equipment Provided</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="text-2xl font-bold text-green-400 mb-1">Performance</div>
              <div className="text-sm text-gray-400">Based Pricing</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="text-2xl font-bold text-green-400 mb-1">24/7</div>
              <div className="text-sm text-gray-400">Expert Support</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/get-started"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-green-600/30 font-semibold text-lg"
            >
              Learn How It Works
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-all duration-300 font-medium text-lg border border-gray-700"
            >
              View Pricing Options
            </Link>
          </div>
        </div>
      </section>

      {/* Core Platform Features */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {isLoading ? (
            <>
              {/* Section header skeleton */}
              <div className="text-center mb-16">
                <div className="w-96 h-10 bg-gray-800 rounded-lg animate-pulse mx-auto mb-4"></div>
                <div className="w-full max-w-3xl h-6 bg-gray-800 rounded-lg animate-pulse mx-auto"></div>
              </div>
              
              {/* Feature cards skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                    <div className="w-14 h-14 bg-gray-700 rounded-xl animate-pulse mb-6"></div>
                    <div className="w-32 h-6 bg-gray-700 rounded animate-pulse mb-3"></div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                          <div className="w-full h-4 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                    <div className="w-24 h-5 bg-gray-700 rounded animate-pulse mt-6"></div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">
                  AI-Powered Platform for Modern Agriculture
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  AI-powered automation, compliance, and intelligent analytics - all secured by blockchain
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Growing Operations */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Growing Operations</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Environmental controls
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Lighting optimization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Crop tracking & yield
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  AI pest diagnosis
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  AI-powered insights
                </li>
              </ul>
              <Link href="/growing" className="mt-6 inline-flex items-center gap-2 text-green-500 hover:text-green-400 font-medium">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Energy & Cost Savings */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Energy Management</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  Real-time optimization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  Demand response
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  Grid participation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  Revenue generation
                </li>
              </ul>
              <Link href="/energy" className="mt-6 inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-medium">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Research & Analytics */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <FlaskConical className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Research & Analytics</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  AI advisor
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Research verification
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Anomaly detection
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Compliance assistant
                </li>
              </ul>
              <Link href="/research" className="mt-6 inline-flex items-center gap-2 text-purple-500 hover:text-purple-400 font-medium">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Equipment Investment Platform */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Equipment Investment</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Equipment board
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Revenue sharing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Smart escrow
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Dispute resolution
                </li>
              </ul>
              <Link href="/equipment-board" className="mt-6 inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-medium">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
            </>
          )}
        </div>
      </section>

      {/* AI Intelligence Suite */}
      <section className="py-24 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border-y border-indigo-800/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">
                AI-Powered Intelligence Suite
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              AI-Powered Intelligence Suite
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Natural language queries, automated compliance, intelligent reports, and fact-based recommendations 
              backed by real-time research verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* AI Cultivation Advisor */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
              <Brain className="w-12 h-12 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">AI Cultivation Advisor</h3>
              <p className="text-gray-400 mb-4">
                Ask questions in plain English. Get instant AI-powered insights and recommendations for your cultivation.
              </p>
              <div className="text-sm text-green-400 font-medium">
                "What's the optimal DLI for Purple Kush in week 4?"
              </div>
            </div>

            {/* Intelligent Reports */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <FileText className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">AI Report Generation</h3>
              <p className="text-gray-400 mb-4">
                Professional reports with AI-generated insights, executive summaries, and actionable recommendations.
              </p>
              <div className="text-sm text-green-400 font-medium">
                Tailored for executives, operations, or investors
              </div>
            </div>

            {/* Anomaly Detection */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
              <Activity className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Anomaly Explanation</h3>
              <p className="text-gray-400 mb-4">
                AI detects and explains anomalies in real-time with root cause analysis and corrective actions.
              </p>
              <div className="text-sm text-green-400 font-medium">
                Prevent issues before they escalate
              </div>
            </div>

            {/* Compliance Assistant */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all">
              <Shield className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">AI Compliance Assistant</h3>
              <p className="text-gray-400 mb-4">
                Automated GMP, GACP, HACCP compliance tracking with AI-generated documentation and audit prep.
              </p>
              <div className="text-sm text-green-400 font-medium">
                Stay audit-ready 24/7
              </div>
            </div>
          </div>

          {/* Research Verification */}
          <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Every Recommendation Backed by Science</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Research Papers', value: '130M+', icon: BookOpen },
                { label: 'Crop Varieties', value: '500+', icon: Leaf },
                { label: 'Growth Stages', value: 'All', icon: Sprout },
                { label: 'Real-time Citations', value: 'Yes', icon: CheckCircle }
              ].map((item, index) => (
                <div key={index} className="text-center p-4 bg-gray-900/50 rounded-lg">
                  <item.icon className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{item.value}</div>
                  <div className="text-xs text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Analytics & Predictive Intelligence */}
      <section className="py-24 bg-gradient-to-br from-emerald-900/10 to-teal-900/10 border-y border-emerald-800/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">
                Predictive Analytics & Performance Optimization
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Advanced Analytics Suite
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              ML-powered predictions, design optimization, and performance correlation to maximize yields and minimize costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Predictive Maintenance */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <Wrench className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Predictive Maintenance AI</h3>
              <p className="text-gray-400 mb-4">
                Predict equipment failures 7-30 days in advance with 92% accuracy. Auto-order parts and optimize schedules.
              </p>
              <div className="text-sm text-green-400 font-medium">
                Reduce downtime by 60%
              </div>
            </div>

            {/* Design Performance Correlation */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <CircuitBoard className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Design Correlation Engine</h3>
              <p className="text-gray-400 mb-4">
                AI correlates design parameters with actual yield outcomes to continuously improve recommendations.
              </p>
              <div className="text-sm text-green-400 font-medium">
                15-20% yield improvement
              </div>
            </div>

            {/* Time-Lag Analysis */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <Activity className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Time-Lag Correlation</h3>
              <p className="text-gray-400 mb-4">
                Detect delayed plant responses to environmental changes. Optimize timing for maximum impact.
              </p>
              <div className="text-sm text-green-400 font-medium">
                Identify cause-effect relationships
              </div>
            </div>

            {/* Fact-Based Design Advisor */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
              <Brain className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Fact-Based Design AI</h3>
              <p className="text-gray-400 mb-4">
                Every design recommendation backed by scientific research and real-world performance data.
              </p>
              <div className="text-sm text-green-400 font-medium">
                Evidence-based optimization
              </div>
            </div>
          </div>

          {/* ROI & Performance Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <Calculator className="w-10 h-10 text-green-500 mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">Maintenance ROI Calculator</h4>
              <p className="text-sm text-gray-400">
                Calculate ROI for fixture cleaning schedules with light degradation modeling.
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <Layers className="w-10 h-10 text-blue-500 mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">3D Biomass Visualizer</h4>
              <p className="text-sm text-gray-400">
                Interactive 3D visualization of biomass vs environmental factors.
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <BarChart3 className="w-10 h-10 text-purple-500 mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">Benchmark Analytics</h4>
              <p className="text-sm text-gray-400">
                Compare performance against industry leaders and identify improvement areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Operations Intelligence */}
      <section className="py-24 bg-gradient-to-br from-purple-900/10 to-pink-900/10 border-y border-purple-800/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Camera className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                AI-Powered Visual Intelligence
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Visual Operations Intelligence
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Transform every worker into an intelligent sensor. Use AI photo analysis to detect issues, 
              verify tasks, and optimize facility operations in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Pest/Disease Detection */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all">
              <Bug className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">IPM Photo Scouting</h3>
              <p className="text-gray-400 mb-4">
                AI detects pests and diseases in 30 seconds with 94% accuracy. Auto-generate alerts and treatment plans.
              </p>
              <div className="text-sm text-green-400 font-medium">
                $50K-$500K saved per critical issue caught early
              </div>
            </div>

            {/* Equipment Diagnostics */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all">
              <Wrench className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Equipment Diagnostics</h3>
              <p className="text-gray-400 mb-4">
                Photo equipment issues and get instant AI analysis with cost estimates and auto-generated work orders.
              </p>
              <div className="text-sm text-green-400 font-medium">
                60% reduction in equipment downtime
              </div>
            </div>

            {/* Safety & Compliance */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-red-600/20 hover:border-red-600/40 transition-all">
              <Shield className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Safety & Compliance</h3>
              <p className="text-gray-400 mb-4">
                Instant safety hazard detection and automated compliance documentation for audits and regulations.
              </p>
              <div className="text-sm text-green-400 font-medium">
                75% reduction in safety incidents
              </div>
            </div>

            {/* Quality Control */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
              <Eye className="w-12 h-12 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Quality Intelligence</h3>
              <p className="text-gray-400 mb-4">
                Photo quality issues and get compliance risk assessment with batch tracking and corrective actions.
              </p>
              <div className="text-sm text-green-400 font-medium">
                50% reduction in customer complaints
              </div>
            </div>
          </div>

          {/* 12 Quick Actions Overview */}
          <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">12 Types of Intelligent Photo Reports</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { icon: Bug, label: 'Pest/Disease', color: 'text-red-500' },
                { icon: Wrench, label: 'Equipment', color: 'text-orange-500' },
                { icon: Shield, label: 'Safety', color: 'text-red-600' },
                { icon: Eye, label: 'Quality', color: 'text-indigo-500' },
                { icon: Package, label: 'Inventory', color: 'text-green-500' },
                { icon: ThermometerSun, label: 'Environmental', color: 'text-blue-500' },
                { icon: CheckCircle, label: 'Task Complete', color: 'text-green-600' },
                { icon: BarChart3, label: 'Compliance', color: 'text-purple-500' },
                { icon: Zap, label: 'Electrical', color: 'text-yellow-500' },
                { icon: Droplets, label: 'Water Leaks', color: 'text-cyan-500' },
                { icon: Sun, label: 'Lighting', color: 'text-yellow-400' },
                { icon: Camera, label: 'Custom', color: 'text-gray-500' }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-3 bg-gray-900/50 rounded-lg">
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                  <span className="text-xs text-gray-300 text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Visual Operations Tier</h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Essential */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600/30 text-center">
                <div className="text-2xl font-bold text-white mb-2">$39</div>
                <div className="text-purple-400 mb-2">Essential Visual</div>
                <div className="text-sm text-gray-400 mb-4">Basic photo reporting</div>
                <div className="text-xs text-gray-500">Manual categorization, 30-day retention</div>
              </div>
              
              {/* Professional - Popular */}
              <div className="bg-blue-800/30 rounded-xl p-6 border border-blue-500/50 text-center relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  POPULAR
                </div>
                <div className="text-2xl font-bold text-white mb-2">$69</div>
                <div className="text-blue-400 mb-2">Professional Visual</div>
                <div className="text-sm text-gray-300 mb-4">AI-powered analysis</div>
                <div className="text-xs text-gray-500">Auto work orders, 90-day retention</div>
              </div>
              
              {/* Enterprise */}
              <div className="bg-purple-800/30 rounded-xl p-6 border border-purple-500/50 text-center">
                <div className="text-2xl font-bold text-white mb-2">$99</div>
                <div className="text-purple-400 mb-2">Enterprise Intelligence</div>
                <div className="text-sm text-gray-300 mb-4">Advanced AI diagnostics</div>
                <div className="text-xs text-gray-500">Custom dashboards, unlimited retention</div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-4 bg-gray-800/50 rounded-xl p-4 border border-green-500/30">
                <div className="text-lg font-semibold text-white">ROI: First Issue Pays For Itself</div>
                <div className="h-6 w-px bg-gray-600"></div>
                <div className="text-sm text-gray-400">Average savings: $12K-$75K annually</div>
                <Link 
                  href="/visual-operations"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 font-medium text-sm"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities Grid */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Comprehensive Platform Capabilities
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Advanced tools and features designed specifically for CEA operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Environmental Control */}
            <div className="group relative bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-800/30 hover:border-green-700/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <ThermometerSun className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Environmental Control</h3>
              </div>
              <p className="text-gray-400">
                Precise control over temperature, humidity, CO2, and VPD with automated adjustments based on crop stage and external conditions.
              </p>
            </div>

            {/* Lighting Systems */}
            <div className="group relative bg-gradient-to-br from-yellow-900/20 to-amber-900/20 rounded-2xl p-8 border border-yellow-800/30 hover:border-yellow-700/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Sun className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Advanced Lighting</h3>
              </div>
              <p className="text-gray-400">
                Spectral optimization, DLI management, photoperiod control, and integration with natural light for maximum efficiency.
              </p>
            </div>

            {/* Sensor Platform */}
            <div className="group relative bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-blue-800/30 hover:border-blue-700/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <CircuitBoard className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">IoT Sensor Network</h3>
              </div>
              <p className="text-gray-400">
                25+ sensor types including LICOR quantum sensors, wireless nodes, and virtual sensors with real-time monitoring.
              </p>
            </div>

            {/* AI/ML Predictions */}
            <div className="group relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-800/30 hover:border-purple-700/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
              </div>
              <p className="text-gray-400">
                Yield predictions, anomaly detection, optimization recommendations, and predictive maintenance powered by machine learning.
              </p>
            </div>

            {/* Crop Management */}
            <div className="group relative bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-2xl p-8 border border-emerald-800/30 hover:border-emerald-700/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Crop Management</h3>
              </div>
              <p className="text-gray-400">
                Batch tracking, growth stage monitoring, harvest planning, and comprehensive traceability from seed to sale.
              </p>
            </div>

            {/* Financial Analytics */}
            <div className="group relative bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-2xl p-8 border border-orange-800/30 hover:border-orange-700/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Financial Analytics</h3>
              </div>
              <p className="text-gray-400">
                Cost per gram tracking, ROI analysis, revenue forecasting, and detailed financial reporting across all operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Investment Platform */}
      <section className="py-24 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-y border-purple-800/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Equipment Investment Platform
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Revolutionary equipment financing through revenue sharing partnerships. No loans, no debt, just shared success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Equipment Request Board */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/20">
              <Package className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Equipment Request Board</h3>
              <p className="text-gray-400 mb-4">
                Post your equipment needs and receive offers from qualified investors. Smart matching based on your requirements.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  No upfront costs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  15% platform fee only
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Smart escrow protection
                </li>
              </ul>
            </div>

            {/* Revenue Sharing */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/20">
              <TrendingUp className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Performance-Based Payments</h3>
              <p className="text-gray-400 mb-4">
                Pay only based on actual performance improvements. Automated revenue sharing with blockchain verification.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Real-time monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Transparent calculations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Automated distribution
                </li>
              </ul>
            </div>

            {/* Dispute Resolution */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-blue-500/20">
              <Shield className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Professional Arbitration</h3>
              <p className="text-gray-400 mb-4">
                Fair dispute resolution with certified arbitrators. Complete protection for both growers and investors.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Evidence management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Quick resolution
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Binding decisions
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/equipment-board"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-purple-600/30 font-semibold text-lg"
            >
              <Package className="w-5 h-5" />
              Browse Equipment Board
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How CEA as a Service Works */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How CEA as a Service Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Simple, transparent, and designed for your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Equipment */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <Building className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">We Provide Equipment</h3>
              <p className="text-gray-400 mb-4">
                Get the latest growing equipment installed at your facility with no upfront investment required.
              </p>
              <div className="text-2xl font-bold text-green-500">$0</div>
              <div className="text-sm text-gray-500">Upfront cost</div>
            </div>

            {/* Performance */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <TrendingUp className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">You Grow Successfully</h3>
              <p className="text-gray-400 mb-4">
                Use our software and equipment to optimize yields, reduce costs, and grow better crops.
              </p>
              <div className="text-2xl font-bold text-blue-500">24/7</div>
              <div className="text-sm text-gray-500">Support included</div>
            </div>

            {/* Sharing */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <HeartHandshake className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">We Share Success</h3>
              <p className="text-gray-400 mb-4">
                Pay only based on actual performance improvements. When you succeed, we succeed together.
              </p>
              <div className="text-2xl font-bold text-purple-500">Fair</div>
              <div className="text-sm text-gray-500">Revenue sharing</div>
            </div>
          </div>

          {/* Partnership Options */}
          <div className="mt-16 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-800/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Flexible Partnership Options
                </h3>
                <p className="text-gray-300 mb-4">
                  Choose the partnership model that works best for your operation. 
                  All agreements are transparent and performance-based.
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Equipment Provided:</span> Get the equipment you need with no upfront cost
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Performance-Based:</span> Pay only when you see real improvements
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Full Support:</span> Training, maintenance, and optimization included
                    </div>
                  </li>
                </ul>
                <Link 
                  href="/get-started"
                  className="mt-6 inline-flex items-center gap-2 text-green-500 hover:text-green-400 font-medium"
                >
                  See Available Options
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-green-500/20 rounded-full mb-4">
                  <Rocket className="w-16 h-16 text-green-500" />
                </div>
                <p className="text-xl font-semibold text-white mb-2">Get Started Today</p>
                <p className="text-sm text-gray-400">Simple application process</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Architecture */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Enterprise-Grade Platform Architecture
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built for scale, security, and reliability
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Integration Capabilities */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <Network className="w-12 h-12 text-cyan-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Universal Integration</h3>
              <p className="text-gray-400 mb-4">
                Seamlessly connects with existing BMS, climate computers, ERPs, and IoT devices. 
                Open API for custom integrations.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Priva, Argus, Link4 compatible</li>
                <li>• REST & GraphQL APIs</li>
                <li>• Webhook support</li>
                <li>• Real-time data sync</li>
              </ul>
            </div>

            {/* Security & Compliance */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <Shield className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Security & Compliance</h3>
              <p className="text-gray-400 mb-4">
                Bank-level security with SOC 2 compliance, end-to-end encryption, and comprehensive audit trails.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• 256-bit encryption</li>
                <li>• Role-based access control</li>
                <li>• GDPR & CCPA compliant</li>
                <li>• 24/7 monitoring</li>
              </ul>
            </div>

            {/* Scalability */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <Layers className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Infinite Scalability</h3>
              <p className="text-gray-400 mb-4">
                From single rooms to multi-facility operations. Cloud-native architecture scales with your business.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Multi-facility support</li>
                <li>• 99.9% uptime SLA</li>
                <li>• Global CDN</li>
                <li>• Auto-scaling infrastructure</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Energy Grid Integration & Revenue */}
      <section className="py-24 bg-gradient-to-br from-yellow-900/10 to-orange-900/10 border-y border-yellow-800/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">
                Turn Your Facility Into a Revenue Generator
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Energy Grid Integration
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Generate new revenue streams by participating in grid programs, demand response, and virtual power plants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-Time Grid Pricing */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
              <DollarSign className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Grid Pricing</h3>
              <p className="text-gray-400 mb-4">
                Automated optimization based on time-of-use rates. Shift loads to save 20-40% on energy costs.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Peak shaving algorithms</li>
                <li>• Load shifting optimization</li>
                <li>• Price forecasting</li>
              </ul>
            </div>

            {/* Demand Response */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all">
              <Battery className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Demand Response Programs</h3>
              <p className="text-gray-400 mb-4">
                Earn revenue by reducing consumption during grid events. $10K-$100K annual revenue potential.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Automated enrollment</li>
                <li>• Event participation</li>
                <li>• Revenue tracking</li>
              </ul>
            </div>

            {/* Virtual Power Plant */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all">
              <Network className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Virtual Power Plant</h3>
              <p className="text-gray-400 mb-4">
                Join collective energy markets. Aggregate capacity with other facilities for higher revenue.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Market bidding</li>
                <li>• Real-time dispatch</li>
                <li>• Revenue sharing</li>
              </ul>
            </div>
          </div>

          {/* Revenue Potential */}
          <div className="mt-12 bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Annual Revenue Potential</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">20-40%</div>
                <div className="text-sm text-gray-400">Energy Cost Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">$10-100K</div>
                <div className="text-sm text-gray-400">Demand Response</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">$5-50K</div>
                <div className="text-sm text-gray-400">Virtual Power Plant</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-gray-400">Automated Trading</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Every Type of CEA Operation
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From boutique grows to industrial-scale operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <Flower2 className="w-12 h-12 text-green-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Cannabis Cultivation</h3>
              <p className="text-gray-400 mb-4">
                Optimize cannabinoid profiles, maintain compliance, track from mother to sale, and maximize quality.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  State compliance tools
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Batch & strain tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Terpene optimization
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <Building className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Vertical Farms</h3>
              <p className="text-gray-400 mb-4">
                Maximize space efficiency, optimize stack lighting, manage multiple crops, and reduce urban energy costs.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Zone-based control
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Stack optimization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Labor tracking
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <Sun className="w-12 h-12 text-yellow-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Greenhouses</h3>
              <p className="text-gray-400 mb-4">
                Integrate natural and supplemental light, optimize heating/cooling, and manage large-scale operations.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  DLI optimization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  Shade curtain control
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-500" />
                  Weather integration
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <GraduationCap className="w-12 h-12 text-purple-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Research Facilities</h3>
              <p className="text-gray-400 mb-4">
                Design experiments, analyze results, publish findings, and advance agricultural science.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  ANOVA & statistics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Trial replication
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  Data export tools
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <Droplets className="w-12 h-12 text-cyan-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Hydroponics</h3>
              <p className="text-gray-400 mb-4">
                Monitor water quality, automate nutrient delivery, and optimize hydroponic growing systems.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-500" />
                  Water quality monitoring
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-500" />
                  pH/EC automation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-500" />
                  Nutrient dosing schedules
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700">
              <Briefcase className="w-12 h-12 text-orange-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Consultants</h3>
              <p className="text-gray-400 mb-4">
                Manage multiple clients, generate reports, provide remote monitoring, and scale your practice.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500" />
                  Multi-client dashboard
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500" />
                  White-label options
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500" />
                  Remote diagnostics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Success Stories */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Success Stories from the Field
            </h2>
            <p className="text-xl text-gray-400">
              Real results from real growers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  VF
                </div>
                <div>
                  <h4 className="font-semibold text-white">VertiFarms Austin</h4>
                  <p className="text-sm text-gray-400">25,000 sq ft vertical farm</p>
                </div>
              </div>
              <blockquote className="text-gray-300 mb-4">
                "Vibelux helped us reduce energy costs by 42% while increasing yields by 18%. 
                The grid revenue alone covers our monthly platform costs."
              </blockquote>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-gray-400">Energy Saved</p>
                  <p className="text-xl font-bold text-green-500">42%</p>
                </div>
                <div>
                  <p className="text-gray-400">Yield Increase</p>
                  <p className="text-xl font-bold text-purple-500">18%</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  GG
                </div>
                <div>
                  <h4 className="font-semibold text-white">Golden Greens</h4>
                  <p className="text-sm text-gray-400">Cannabis cultivation</p>
                </div>
              </div>
              <blockquote className="text-gray-300 mb-4">
                "The spectral analysis tools helped us dial in our lighting perfectly. 
                Quality is up, and we're saving $12k/month on energy."
              </blockquote>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-gray-400">Monthly Savings</p>
                  <p className="text-xl font-bold text-green-500">$12K</p>
                </div>
                <div>
                  <p className="text-gray-400">THC Increase</p>
                  <p className="text-xl font-bold text-purple-500">15%</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  UG
                </div>
                <div>
                  <h4 className="font-semibold text-white">Urban Greens NYC</h4>
                  <p className="text-sm text-gray-400">Rooftop greenhouse</p>
                </div>
              </div>
              <blockquote className="text-gray-300 mb-4">
                "Participating in NYC's demand response program through Vibelux generates 
                $75k annually with zero effort on our part."
              </blockquote>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-gray-400">Grid Revenue</p>
                  <p className="text-xl font-bold text-green-500">$75K</p>
                </div>
                <div>
                  <p className="text-gray-400">ROI Period</p>
                  <p className="text-xl font-bold text-purple-500">3 mo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-900/20 to-green-900/20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your CEA Operation?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of facilities already optimizing their operations, reducing costs, 
            and generating new revenue streams with Vibelux.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/demo"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full transition-all duration-300 shadow-xl hover:shadow-purple-600/30 font-medium text-lg"
            >
              <Eye className="w-5 h-5" />
              Schedule Live Demo
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

          <p className="mt-8 text-sm text-gray-400">
            No credit card required • 30-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Vibelux</span>
              </div>
              <p className="text-gray-400 mb-4">
                The most advanced platform for controlled environment agriculture. 
                Grow smarter, save more, and unlock new revenue streams.
              </p>
              <div className="flex gap-4">
                <Link href="/twitter" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </Link>
                <Link href="/linkedin" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </Link>
                <Link href="/youtube" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Solutions</h3>
              <ul className="space-y-2">
                <li><Link href="/growing" className="text-gray-400 hover:text-white transition-colors">Growing Ops</Link></li>
                <li><Link href="/energy" className="text-gray-400 hover:text-white transition-colors">Energy Mgmt</Link></li>
                <li><Link href="/research" className="text-gray-400 hover:text-white transition-colors">Research</Link></li>
                <li><Link href="/marketplace" className="text-gray-400 hover:text-white transition-colors">Marketplace</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/integrations" className="text-gray-400 hover:text-white transition-colors">IoT & Integrations</Link></li>
                <li><Link href="/integrations/utility-api" className="text-gray-400 hover:text-white transition-colors">Utility API</Link></li>
                <li><Link href="/api" className="text-gray-400 hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/investment" className="text-gray-400 hover:text-white transition-colors">Investment</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 Vibelux. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link>
              <Link href="/security" className="text-gray-400 hover:text-white transition-colors text-sm">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

{/* Badge Component */}
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      {children}
    </div>
  )
}
