'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Zap, 
  Battery, 
  TrendingDown, 
  DollarSign, 
  Shield, 
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Settings,
  BarChart3,
  Lightbulb,
  Sun,
  Moon,
  Wind,
  Gauge,
  Target,
  Award,
  Leaf,
  Menu,
  X,
  Calculator,
  Thermometer
} from 'lucide-react';

export default function EnergyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">VibeLux</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/energy-dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/energy-setup" className="text-gray-300 hover:text-white transition-colors">Setup</Link>
              <Link href="/energy-monitoring" className="text-gray-300 hover:text-white transition-colors">Monitoring</Link>
              <Link href="/pricing" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <div className="flex flex-col gap-4">
                <Link href="/energy-dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/energy-setup" className="text-gray-300 hover:text-white transition-colors">Setup</Link>
                <Link href="/energy-monitoring" className="text-gray-300 hover:text-white transition-colors">Monitoring</Link>
                <Link href="/pricing" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center">
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">
                AI-Powered Energy Optimization
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-200 to-orange-400 bg-clip-text text-transparent">
              Smart Energy Management
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Intelligent demand response and grid optimization for cultivation facilities. 
              Monitor energy usage and optimize operations without compromising plant health.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/energy-setup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-4 rounded-lg font-medium hover:scale-105 transition-transform"
              >
                <Settings className="w-5 h-5" />
                Start Energy Setup
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/energy-dashboard"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                View Dashboard
              </Link>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Real-Time</div>
                <div className="text-sm text-gray-400">Energy Monitoring</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-gray-400">System Monitoring</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Smart</div>
                <div className="text-sm text-gray-400">Optimization</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Easy</div>
                <div className="text-sm text-gray-400">Integration</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How Energy Optimization Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Monitor energy usage, track costs, and optimize your facility's power consumption 
              with intelligent controls and real-time analytics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Energy Monitoring</h3>
              <p className="text-gray-400 mb-6">
                Connect to your existing control system to monitor energy usage patterns 
                and track consumption across your facility.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Control system integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Real-time usage tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Cost analysis tools
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-yellow-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Smart Controls</h3>
              <p className="text-gray-400 mb-6">
                Intelligent control systems that can be configured to optimize energy usage 
                while maintaining your cultivation requirements.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Configurable automation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Schedule optimization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Custom parameters
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Analytics & Reporting</h3>
              <p className="text-gray-400 mb-6">
                Comprehensive energy analytics with detailed reporting and insights 
                to help you understand and optimize your facility's performance.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Usage analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Cost tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Detailed reporting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Advanced Energy Features</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive energy management tools designed specifically for controlled environment agriculture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Time-of-Use Optimization",
                description: "Automatically shift non-critical loads to off-peak hours when electricity rates are lowest."
              },
              {
                icon: Target,
                title: "Demand Response",
                description: "Participate in utility demand response programs to earn additional revenue during grid events."
              },
              {
                icon: Battery,
                title: "Battery Integration",
                description: "Optimize battery charging and discharging cycles to maximize savings and grid revenue."
              },
              {
                icon: Sun,
                title: "Solar Coordination",
                description: "Coordinate with solar panels to maximize self-consumption and minimize grid dependency."
              },
              {
                icon: Shield,
                title: "Plant Protection",
                description: "Advanced algorithms ensure energy optimizations never compromise plant health or yields."
              },
              {
                icon: Gauge,
                title: "Real-Time Analytics",
                description: "Live dashboards showing energy usage, costs, savings, and grid conditions."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Works with Your Equipment</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Seamlessly integrates with leading climate control systems and lighting equipment.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              "Argus Controls",
              "Priva",
              "TrolMaster",
              "Link4 Corporation",
              "Heliospectra",
              "Fluence",
              "Current by GE",
              "Signify"
            ].map((partner, index) => (
              <div key={index} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 text-center">
                <span className="text-gray-300 font-medium">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Energy Calculator */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-3xl p-8 border border-yellow-600/30 text-center">
            <h2 className="text-3xl font-bold mb-4">Energy Analysis Tools</h2>
            <p className="text-gray-400 mb-8">
              Use our calculators and analysis tools to understand your facility's energy usage
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Link 
                href="/calculators/electrical-estimator"
                className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-700/50 transition-colors"
              >
                <Calculator className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Electrical Calculator</h3>
                <p className="text-sm text-gray-400">Calculate electrical requirements</p>
              </Link>
              
              <Link 
                href="/calculators/heat-load"
                className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-700/50 transition-colors"
              >
                <Thermometer className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Heat Load Calculator</h3>
                <p className="text-sm text-gray-400">Analyze thermal requirements</p>
              </Link>
              
              <Link 
                href="/pricing/calculator"
                className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-700/50 transition-colors"
              >
                <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Cost Analysis</h3>
                <p className="text-sm text-gray-400">Analyze operational costs</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Start Saving Today</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join hundreds of cultivation facilities already saving with VibeLux energy optimization.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/energy-setup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-4 rounded-lg font-medium hover:scale-105 transition-transform"
            >
              <Settings className="w-5 h-5" />
              Start Free Setup
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/pricing"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              View Pricing
            </Link>
          </div>

          <div className="text-sm text-gray-500">
            ✓ No upfront costs  ✓ 5-minute setup  ✓ Cancel anytime
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VibeLux</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered energy optimization for cultivation facilities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Energy Solutions</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/energy-dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/energy-monitoring" className="hover:text-white transition-colors">Real-time Monitoring</Link></li>
                <li><Link href="/demand-response" className="hover:text-white transition-colors">Demand Response</Link></li>
                <li><Link href="/battery-optimization" className="hover:text-white transition-colors">Battery Storage</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
                <li><Link href="/calculators/roi" className="hover:text-white transition-colors">ROI Calculator</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 VibeLux. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}