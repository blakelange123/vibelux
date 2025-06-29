'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Brain, 
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
  Zap,
  Sun,
  Sprout,
  TreePine,
  Atom,
  TestTube,
  ScanLine,
  Waves,
  Radio,
  Cpu,
  Database,
  Bot
} from 'lucide-react';
import { ReinforcementLearningDashboard } from '@/components/ReinforcementLearningDashboard';

export default function AIOptimizationPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('rl-optimizer');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">VibeLux</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/research" className="text-gray-300 hover:text-white transition-colors">Research</Link>
              <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors">Analytics</Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
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
                <Link href="/research" className="text-gray-300 hover:text-white transition-colors">Research</Link>
                <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors">Analytics</Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/pricing" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center">
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                Advanced AI Optimization
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-400 bg-clip-text text-transparent">
              AI-Powered Growth Optimization
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Advanced machine learning and reinforcement learning systems that continuously optimize 
              your cultivation environment for maximum yield, quality, and efficiency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="#rl-optimizer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:scale-105 transition-transform"
              >
                <Bot className="w-5 h-5" />
                Start AI Training
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/analytics"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </Link>
            </div>

            {/* Key Capabilities */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Self-Learning</div>
                <div className="text-sm text-gray-400">AI Algorithms</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Real-Time</div>
                <div className="text-sm text-gray-400">Optimization</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Predictive</div>
                <div className="text-sm text-gray-400">Analytics</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-2xl font-bold text-white mb-1">Continuous</div>
                <div className="text-sm text-gray-400">Improvement</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Overview */}
      <section className="py-20 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Advanced AI Capabilities</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive machine learning suite designed specifically for controlled environment agriculture.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Reinforcement Learning Optimizer</h3>
              <p className="text-gray-400 mb-6">
                AI that learns optimal cultivation strategies through trial and feedback, 
                continuously improving environmental control decisions.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Q-Learning algorithms for action optimization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Real-time reward system based on plant response
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Continuous learning and adaptation
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Anomaly Detection Engine</h3>
              <p className="text-gray-400 mb-6">
                Advanced ML models that detect unusual patterns in plant behavior, 
                environmental conditions, and equipment performance.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Statistical outlier detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Early warning system for issues
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Confidence scoring for alerts
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Cpu className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Custom ML Model Builder</h3>
              <p className="text-gray-400 mb-6">
                Build and train custom machine learning models for specific cultivation 
                goals using your facility's unique data.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  TensorFlow.js integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Multiple model architectures
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Synthetic data generation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'rl-optimizer', label: 'RL Optimizer', icon: Brain },
              { id: 'anomaly-detection', label: 'Anomaly Detection', icon: AlertTriangle },
              { id: 'model-builder', label: 'Model Builder', icon: Cpu },
              { id: 'synthetic-data', label: 'Synthetic Data', icon: Database }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Content Based on Active Tab */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {activeTab === 'rl-optimizer' && (
            <div id="rl-optimizer">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Reinforcement Learning Growth Optimizer</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Watch the AI learn optimal cultivation strategies through trial and feedback loops.
                </p>
              </div>
              <ReinforcementLearningDashboard />
            </div>
          )}

          {activeTab === 'anomaly-detection' && (
            <div className="text-center py-16">
              <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Anomaly Detection Engine</h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                Advanced anomaly detection is available in the main analytics dashboard.
              </p>
              <Link 
                href="/analytics"
                className="inline-flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                View Analytics Dashboard
              </Link>
            </div>
          )}

          {activeTab === 'model-builder' && (
            <div className="text-center py-16">
              <Cpu className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Custom ML Model Builder</h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                Build custom machine learning models for your specific cultivation needs.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <TestTube className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Model Training</h3>
                  <p className="text-sm text-gray-400">Train custom models with your cultivation data</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <LineChart className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Performance Metrics</h3>
                  <p className="text-sm text-gray-400">Track model accuracy and optimization</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Model Export</h3>
                  <p className="text-sm text-gray-400">Export trained models for production use</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'synthetic-data' && (
            <div className="text-center py-16">
              <Database className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Synthetic Data Generator</h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                Generate synthetic cultivation data for training and testing ML models.
              </p>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Data Synthesis Features</h3>
                  <ul className="space-y-2 text-left text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Environmental parameter simulation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Plant growth pattern modeling
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Stress response simulation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Quality metrics generation
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Use Cases</h3>
                  <ul className="space-y-2 text-left text-gray-300">
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      Model training augmentation
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      Scenario testing and validation
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      Research and development
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      Edge case simulation
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready for AI-Powered Optimization?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Start using advanced machine learning to optimize your cultivation operations today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/research"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:scale-105 transition-transform"
            >
              <Brain className="w-5 h-5" />
              Start AI Training
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Contact AI Team
            </Link>
          </div>

          <div className="text-sm text-gray-500">
            ✓ Advanced ML algorithms  ✓ Continuous learning  ✓ Expert support
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
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VibeLux</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered cultivation optimization platform.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">AI Tools</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/ai-optimization" className="hover:text-white transition-colors">RL Optimizer</Link></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors">Anomaly Detection</Link></li>
                <li><Link href="/research" className="hover:text-white transition-colors">Model Builder</Link></li>
                <li><Link href="/plant-biology" className="hover:text-white transition-colors">Biology Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Research</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/research" className="hover:text-white transition-colors">Research Platform</Link></li>
                <li><Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
                <li><Link href="/publications" className="hover:text-white transition-colors">Publications</Link></li>
                <li><Link href="/collaboration" className="hover:text-white transition-colors">Collaboration</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API Docs</Link></li>
                <li><Link href="/training" className="hover:text-white transition-colors">Training</Link></li>
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