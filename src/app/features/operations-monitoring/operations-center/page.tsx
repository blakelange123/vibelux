'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Monitor,
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Gauge,
  Shield,
  Smartphone,
  Wifi,
  Play,
  BookOpen,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Real-Time Monitoring',
    description: 'Track temperature, humidity, CO2, light levels, and more in real-time'
  },
  {
    icon: AlertTriangle,
    title: 'Smart Alerts',
    description: 'Get instant notifications when parameters drift outside optimal ranges'
  },
  {
    icon: BarChart3,
    title: 'Historical Analytics',
    description: 'Analyze trends and patterns with comprehensive data visualization'
  },
  {
    icon: Gauge,
    title: 'Custom Dashboards',
    description: 'Build personalized dashboards for different facility areas and crops'
  },
  {
    icon: Wifi,
    title: 'Remote Control',
    description: 'Adjust settings and respond to issues from anywhere in the world'
  },
  {
    icon: Smartphone,
    title: 'Mobile Access',
    description: 'Full functionality on iOS and Android devices for on-the-go management'
  }
];

const integrations = [
  'Trolmaster', 'Growlink', 'Argus', 'Priva', 'Link4', 'Ridder', 'Hoogendoorn', 'Custom APIs'
];

export default function OperationsCenterFeaturePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-600/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Features
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div className="px-4 py-2 bg-green-500/20 rounded-full">
                <span className="text-sm font-medium text-green-300">Operations & Monitoring</span>
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-6">
              Operations Center
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Your command center for complete facility oversight. Monitor, control, and optimize 
              every aspect of your growing operation from a single, powerful dashboard.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/operations"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                Open Operations Center
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Dashboard Preview */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden bg-gray-800 aspect-video"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-blue-600/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-500">Live Operations Dashboard</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Complete Facility Control at Your Fingertips
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-6"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Monitoring Capabilities */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">What You Can Monitor</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-green-400 mb-2">Environmental Conditions</h3>
                  <p className="text-gray-400">Temperature, humidity, CO2, VPD, air flow, and pressure differentials</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-400 mb-2">Lighting Systems</h3>
                  <p className="text-gray-400">PPFD levels, photoperiod, spectrum, energy consumption, and fixture health</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-400 mb-2">Irrigation & Fertigation</h3>
                  <p className="text-gray-400">Water usage, EC/pH levels, nutrient dosing, and runoff monitoring</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-400 mb-2">Energy & Resources</h3>
                  <p className="text-gray-400">Power consumption, water usage, HVAC efficiency, and carbon footprint</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Integration Partners</h2>
              
              <p className="text-gray-400 mb-6">
                Connect your existing control systems and sensors for unified monitoring:
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {integrations.map((partner) => (
                  <div key={partner} className="bg-gray-800 rounded-lg px-4 py-3 text-center">
                    <span className="text-gray-300">{partner}</span>
                  </div>
                ))}
              </div>

              <div className="bg-green-900/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Enterprise Security
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>End-to-end encryption for all data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Role-based access control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Audit logs and compliance reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>SOC 2 Type II certified</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Alert System */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Intelligent Alert System</h2>
          
          <div className="bg-gray-800 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Multi-Channel Alerts
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• SMS text messages</li>
                  <li>• Push notifications</li>
                  <li>• Email alerts</li>
                  <li>• In-app notifications</li>
                  <li>• Phone calls for critical issues</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Smart Alert Features
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• Customizable thresholds</li>
                  <li>• Alert escalation chains</li>
                  <li>• Quiet hours settings</li>
                  <li>• Predictive warnings</li>
                  <li>• Alert acknowledgment tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Proven Results</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-4xl font-bold text-green-400 mb-2">45%</div>
              <p className="text-gray-400">Reduction in crop loss</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-4xl font-bold text-blue-400 mb-2">60%</div>
              <p className="text-gray-400">Faster issue response</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">30%</div>
              <p className="text-gray-400">Energy savings</p>
            </div>
          </div>

          <p className="text-xl text-gray-300">
            "The Operations Center paid for itself in the first month by preventing a 
            single HVAC failure from ruining our crop."
          </p>
          <p className="text-gray-400 mt-2">- Sarah Chen, Facility Manager</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Take Control of Your Facility
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start monitoring and optimizing your operation today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/operations"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-lg transition-colors"
            >
              Launch Operations Center
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium text-lg transition-colors"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}