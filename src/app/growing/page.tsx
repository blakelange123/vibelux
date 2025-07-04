'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Sprout, 
  Activity, 
  TrendingUp, 
  Shield, 
  Users, 
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Settings,
  Lightbulb,
  Droplets,
  Thermometer,
  Wind,
  Camera,
  Target,
  Award,
  Leaf,
  Menu,
  X,
  Microscope,
  FlaskConical,
  LineChart,
  Gauge,
  Calendar,
  ClipboardCheck,
  Eye,
  Brain,
  Zap,
  Sun
} from 'lucide-react';

export default function GrowingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">VibeLux</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/cultivation" className="text-gray-300 hover:text-white transition-colors">Cultivation</Link>
              <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors">Analytics</Link>
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
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/cultivation" className="text-gray-300 hover:text-white transition-colors">Cultivation</Link>
                <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors">Analytics</Link>
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
        <div className="absolute inset-0 bg-gradient-to-b from-green-600/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Sprout className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">
                Advanced Growing Operations
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-green-200 to-emerald-400 bg-clip-text text-transparent">
              Optimize Every Aspect of Your Grow
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Complete cultivation management platform with environmental monitoring, data analytics, 
              and digital tools to help optimize your growing operations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/cultivation"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-lg font-medium hover:scale-105 transition-transform"
              >
                <Sprout className="w-5 h-5" />
                Start Growing
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                View Dashboard
              </Link>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Data</div>
                <div className="text-sm text-gray-400">Driven Insights</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Real-Time</div>
                <div className="text-sm text-gray-400">Monitoring</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Smart</div>
                <div className="text-sm text-gray-400">Analytics</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-gray-400">System Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Complete Growing Operations Platform</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to manage, monitor, and optimize your cultivation operations 
              from seed to harvest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Environmental Monitoring</h3>
              <p className="text-gray-400 mb-6">
                Monitor your grow environment with sensor integration and 
                data analytics to track key environmental parameters.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Temperature & humidity tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  CO₂ levels and air quality
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Light intensity and spectrum
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Water quality and pH
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Data Analytics</h3>
              <p className="text-gray-400 mb-6">
                Analyze your cultivation data with comprehensive reporting tools 
                and insights to help inform growing decisions.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Growth tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Environmental alerts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Data visualization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Usage reporting
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Settings className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">System Integration</h3>
              <p className="text-gray-400 mb-6">
                Connect with existing control systems and equipment to centralize 
                data collection and operational management.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Control system integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Equipment monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Data aggregation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Workflow management
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cultivation Tools */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Advanced Growing Tools</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Professional-grade tools and analytics to take your cultivation to the next level.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: "Plant Health Imaging",
                description: "Digital imaging tools for documenting and tracking plant health over time.",
                link: "/plant-monitoring"
              },
              {
                icon: LineChart,
                title: "Growth Analytics",
                description: "Data visualization and reporting tools for tracking cultivation metrics.",
                link: "/analytics"
              },
              {
                icon: Droplets,
                title: "Irrigation Management",
                description: "Irrigation tracking and management tools with scheduling capabilities.",
                link: "/cultivation/irrigation"
              },
              {
                icon: Sun,
                title: "Light Optimization",
                description: "Lighting analysis tools and calculators for optimizing light distribution.",
                link: "/lighting-tools"
              },
              {
                icon: FlaskConical,
                title: "Nutrient Tracking",
                description: "Precise nutrient management with automated dosing and EC/pH monitoring.",
                link: "/cultivation/nutrients"
              },
              {
                icon: Calendar,
                title: "Harvest Planning",
                description: "Predictive harvest scheduling with quality assessment and yield forecasting.",
                link: "/harvest"
              },
              {
                icon: Target,
                title: "Crop Steering",
                description: "Advanced cultivation techniques to direct plant growth and improve quality.",
                link: "/cultivation/crop-steering"
              },
              {
                icon: Microscope,
                title: "Lab Integration",
                description: "Connect lab testing results for complete quality control workflows.",
                link: "/quality"
              },
              {
                icon: ClipboardCheck,
                title: "Compliance Tracking",
                description: "Automated compliance documentation for regulatory requirements.",
                link: "/compliance"
              }
            ].map((tool, index) => (
              <Link 
                key={index} 
                href={tool.link}
                className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:scale-105 group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <tool.icon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-green-400 transition-colors">{tool.title}</h3>
                <p className="text-gray-400 mb-4">{tool.description}</p>
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Integrates with Your Equipment</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Works seamlessly with leading climate control systems, sensors, and cultivation equipment.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              "Argus Controls",
              "Priva",
              "TrolMaster",
              "LiCor",
              "Apogee Instruments",
              "Meter Group",
              "Campbell Scientific",
              "Onset HOBO"
            ].map((partner, index) => (
              <div key={index} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 text-center">
                <span className="text-gray-300 font-medium">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultivation Stages */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Optimize Every Growth Stage</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Stage-specific optimization from propagation to harvest with tailored environmental controls.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                stage: "Propagation",
                icon: Sprout,
                description: "Track germination and early root development",
                metrics: ["Germination tracking", "Growth monitoring", "Environmental logging"]
              },
              {
                stage: "Vegetative",
                icon: Leaf,
                description: "Monitor vegetative growth and canopy development",
                metrics: ["Growth measurements", "Node tracking", "Structure documentation"]
              },
              {
                stage: "Flowering",
                icon: Sun,
                description: "Document flower development and quality metrics",
                metrics: ["Development tracking", "Quality documentation", "Harvest planning"]
              },
              {
                stage: "Harvest",
                icon: Award,
                description: "Record harvest data and quality assessments",
                metrics: ["Harvest documentation", "Quality testing", "Yield recording"]
              }
            ].map((stage, index) => (
              <div key={index} className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stage.icon className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{stage.stage}</h3>
                <p className="text-gray-400 mb-4">{stage.description}</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  {stage.metrics.map((metric, idx) => (
                    <li key={idx} className="flex items-center gap-2 justify-center">
                      <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Platform Benefits</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Digital tools and data insights to help improve your cultivation operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                feature: "Centralized Data",
                title: "All Your Data in One Place",
                description: "Combine environmental, operational, and cultivation data in a single platform for better insights."
              },
              {
                feature: "Real-Time Monitoring",
                title: "Stay Connected to Your Grow",
                description: "Monitor your facility remotely with real-time alerts and notifications."
              },
              {
                feature: "Digital Documentation",
                title: "Streamlined Record Keeping",
                description: "Digital tools for compliance documentation and operational record keeping."
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
                <div className="text-2xl font-bold text-green-400 mb-2">{benefit.feature}</div>
                <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Start Growing Smarter Today</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join the future of cultivation with AI-powered growing operations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/cultivation"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-lg font-medium hover:scale-105 transition-transform"
            >
              <Sprout className="w-5 h-5" />
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/demo"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Book Demo
            </Link>
          </div>

          <div className="text-sm text-gray-500">
            ✓ 14-day free trial  ✓ No setup fees  ✓ Cancel anytime
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
                  <Sprout className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VibeLux</span>
              </div>
              <p className="text-gray-400 text-sm">
                Advanced cultivation management for optimal yields and quality.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Growing Tools</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/cultivation" className="hover:text-white transition-colors">Cultivation Manager</Link></li>
                <li><Link href="/plant-monitoring" className="hover:text-white transition-colors">Plant Health Monitoring</Link></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors">Growth Analytics</Link></li>
                <li><Link href="/harvest" className="hover:text-white transition-colors">Harvest Planning</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
                <li><Link href="/calculators" className="hover:text-white transition-colors">Calculators</Link></li>
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