'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Microscope, 
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
  FlaskConical,
  LineChart,
  Gauge,
  Calendar,
  ClipboardCheck,
  Eye,
  Brain,
  Zap,
  Sun,
  Sprout,
  TreePine,
  Atom,
  TestTube,
  ScanLine,
  Waves,
  Radio
} from 'lucide-react';

export default function PlantBiologyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Microscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">VibeLux</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/research" className="text-gray-300 hover:text-white transition-colors">Research Tools</Link>
              <Link href="/growing" className="text-gray-300 hover:text-white transition-colors">Growing</Link>
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
                <Link href="/research" className="text-gray-300 hover:text-white transition-colors">Research Tools</Link>
                <Link href="/growing" className="text-gray-300 hover:text-white transition-colors">Growing</Link>
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
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Microscope className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                Advanced Plant Biology Analytics
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-400 bg-clip-text text-transparent">
              Physiological Monitoring & Analysis
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Advanced plant biology monitoring tools for indoor cultivation. Track hormonal responses, 
              stress indicators, and photosynthetic efficiency at the cellular level.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/research"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:scale-105 transition-transform"
              >
                <Microscope className="w-5 h-5" />
                Explore Research Tools
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </Link>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Cellular</div>
                <div className="text-sm text-gray-400">Level Analysis</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Hormonal</div>
                <div className="text-sm text-gray-400">Response Tracking</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Stress</div>
                <div className="text-sm text-gray-400">Early Detection</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Real-Time</div>
                <div className="text-sm text-gray-400">Physiological Data</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Biology Features */}
      <section className="py-20 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Hormonal & Growth Regulation Monitoring</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Track plant hormones and growth regulators to optimize training techniques and harvest timing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mb-6">
                <TreePine className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Auxin Distribution Mapper</h3>
              <p className="text-gray-400 mb-6">
                Monitor auxin hormone distribution for optimizing training techniques like LST, 
                SCROG, and canopy management strategies.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Growth direction analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Training response prediction
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Apical dominance tracking
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-orange-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Ethylene Ripening Forecaster</h3>
              <p className="text-gray-400 mb-6">
                Predict optimal harvest timing and manage post-harvest handling by monitoring 
                ethylene production and sensitivity.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Harvest timing optimization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Ripening rate prediction
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Post-harvest quality control
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">ABA Stress Monitor</h3>
              <p className="text-gray-400 mb-6">
                Detect plant stress before visible symptoms appear by monitoring 
                Abscisic Acid levels and stress response pathways.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Early stress detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Drought response monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Environmental stress alerts
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stress & Defense Mechanisms */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Stress & Defense Mechanisms</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Monitor plant defense systems and stress responses for optimal environmental control.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-xl flex items-center justify-center mb-4">
                <Thermometer className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Heat-Stress Photosynthesis Threshold</h3>
              <p className="text-gray-400 mb-4">Monitor photosynthetic efficiency under heat stress for LED and HVAC optimization.</p>
            </div>

            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl flex items-center justify-center mb-4">
                <Droplets className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">VPD Damage Model</h3>
              <p className="text-gray-400 mb-4">Advanced vapor pressure deficit analysis to prevent environmental stress damage.</p>
            </div>

            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Pathogen Response SAR Tracker</h3>
              <p className="text-gray-400 mb-4">Early disease detection through systemic acquired resistance monitoring.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Photosynthesis & Respiration */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Photosynthesis & Respiration Analysis</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Optimize light spectrum and CO₂ supplementation with cellular-level photosynthetic monitoring.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600/20 to-yellow-600/20 rounded-xl flex items-center justify-center mb-4">
                <Sun className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Far-Red/Red Ratio Flowering Trigger</h3>
              <p className="text-gray-400 mb-4">Control flowering timing through precise LED spectrum management and phytochrome responses.</p>
            </div>

            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl flex items-center justify-center mb-4">
                <Atom className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Photorespiration Minimizer</h3>
              <p className="text-gray-400 mb-4">Optimize CO₂ supplementation strategies by analyzing C3/C4/CAM photosynthetic pathways.</p>
            </div>

            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl flex items-center justify-center mb-4">
                <Gauge className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Chloroplast Thermotolerance Assessor</h3>
              <p className="text-gray-400 mb-4">Monitor membrane stability under high-intensity LED lighting to prevent heat damage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Sensing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Advanced Sensing & Signaling</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Specialized monitoring for advanced cultivation techniques and environmental optimization.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-4">
                <Radio className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Phytochrome PFR/PR Converter</h3>
              <p className="text-gray-400 mb-4">Advanced lighting control for precise photoperiod manipulation and flowering triggers.</p>
            </div>

            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Circadian Rhythm Desynchrony Detector</h3>
              <p className="text-gray-400 mb-4">Optimize light cycles for maximum efficiency by monitoring internal plant clocks.</p>
            </div>

            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl flex items-center justify-center mb-4">
                <ScanLine className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">ROS Scavenger Tracker</h3>
              <p className="text-gray-400 mb-4">Monitor oxidative stress from high-intensity lighting and environmental factors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Integration */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Research-Grade Technology</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Scientific instruments and analytical methods for professional cultivation research.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TestTube,
                title: "Biochemical Analysis",
                description: "Hormone and metabolite quantification"
              },
              {
                icon: Microscope,
                title: "Cellular Imaging",
                description: "High-resolution plant tissue analysis"
              },
              {
                icon: Waves,
                title: "Spectral Analysis",
                description: "Advanced light quality measurement"
              },
              {
                icon: Activity,
                title: "Physiological Sensors",
                description: "Real-time plant response monitoring"
              }
            ].map((tech, index) => (
              <div key={index} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <tech.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{tech.title}</h3>
                <p className="text-sm text-gray-400">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Advanced Plant Biology Research</h2>
          <p className="text-xl text-gray-400 mb-8">
            Unlock the full potential of your cultivation with scientific-grade plant biology monitoring.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/research"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:scale-105 transition-transform"
            >
              <Microscope className="w-5 h-5" />
              Explore Research Tools
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Contact Research Team
            </Link>
          </div>

          <div className="text-sm text-gray-500">
            ✓ Research-grade instruments  ✓ Scientific methodology  ✓ Expert support
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
                  <Microscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VibeLux</span>
              </div>
              <p className="text-gray-400 text-sm">
                Advanced plant biology research tools for cultivation optimization.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Biology Tools</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/research" className="hover:text-white transition-colors">Research Platform</Link></li>
                <li><Link href="/plant-monitoring" className="hover:text-white transition-colors">Plant Monitoring</Link></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors">Data Analytics</Link></li>
                <li><Link href="/calculators" className="hover:text-white transition-colors">Calculators</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Research</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
                <li><Link href="/publications" className="hover:text-white transition-colors">Publications</Link></li>
                <li><Link href="/methodology" className="hover:text-white transition-colors">Methodology</Link></li>
                <li><Link href="/collaboration" className="hover:text-white transition-colors">Collaboration</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/training" className="hover:text-white transition-colors">Training</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API Docs</Link></li>
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