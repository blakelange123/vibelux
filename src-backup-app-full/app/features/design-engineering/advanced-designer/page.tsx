'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  Maximize2,
  Move3D,
  Grid3X3,
  Download,
  Share2,
  Zap,
  MousePointer,
  Settings,
  Play,
  BookOpen,
  Monitor
} from 'lucide-react';

const features = [
  {
    icon: MousePointer,
    title: 'Intuitive Drag & Drop',
    description: 'Place fixtures with precision using our smart snapping system'
  },
  {
    icon: Grid3X3,
    title: 'Auto-Layout Engine',
    description: 'Automatically optimize fixture placement for uniform coverage'
  },
  {
    icon: Maximize2,
    title: 'Real-time PPFD Calculations',
    description: 'See light intensity heatmaps update instantly as you design'
  },
  {
    icon: Move3D,
    title: '2D/3D Visualization',
    description: 'Switch between 2D planning and 3D preview modes seamlessly'
  },
  {
    icon: Download,
    title: 'Export to CAD',
    description: 'Download designs in DWG, DXF, or PDF formats'
  },
  {
    icon: Share2,
    title: 'Team Collaboration',
    description: 'Share designs with clients and team members in real-time'
  }
];

const benefits = [
  'Reduce design time by 80%',
  'Ensure optimal light uniformity',
  'Calculate exact fixture requirements',
  'Prevent costly design mistakes',
  'Generate professional proposals',
  'Meet DLI targets precisely'
];

export default function AdvancedDesignerFeaturePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-transparent to-transparent" />
        
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
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div className="px-4 py-2 bg-blue-500/20 rounded-full">
                <span className="text-sm font-medium text-blue-300">Design & Engineering</span>
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-6">
              Advanced Designer
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Professional-grade lighting design software that combines the power of CAD with 
              intelligent cultivation algorithms. Design complete facilities in minutes, not hours.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/design/advanced"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Launch Designer
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

      {/* Visual Preview */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden bg-gray-800 aspect-video"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Advanced Designer Interface Preview</p>
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
            Powerful Features for Professional Designers
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
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Technical Capabilities</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">Supported Formats</h3>
                  <p className="text-gray-400 mb-3">
                    Import and export designs in industry-standard formats:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['DWG', 'DXF', 'PDF', 'PNG', 'SVG', 'IES'].map((format) => (
                      <span key={format} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">Calculation Engine</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Ray-tracing algorithm for accurate light distribution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Considers fixture beam angle and wall reflectance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Accounts for light degradation over distance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Supports custom fixture photometric data</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">Design Constraints</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>• Maximum room size: 500,000 sq ft</li>
                    <li>• Maximum fixtures: 10,000 per design</li>
                    <li>• Grid resolution: 1-inch precision</li>
                    <li>• Height range: 1-100 feet</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Why Choose Advanced Designer?</h2>
              
              <div className="bg-blue-900/20 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Key Benefits
                </h3>
                <ul className="space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Perfect For:</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• Lighting consultants and designers</li>
                  <li>• Facility planners and architects</li>
                  <li>• Equipment manufacturers and distributors</li>
                  <li>• Large-scale cultivation facilities</li>
                  <li>• Retrofit project planning</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tutorials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Learn Advanced Designer</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Getting Started Guide',
                duration: '10 min read',
                description: 'Learn the basics of the Advanced Designer interface',
                link: '/tutorials/designer-basics'
              },
              {
                title: 'Auto-Layout Deep Dive',
                duration: '15 min video',
                description: 'Master the automatic fixture placement algorithms',
                link: '/tutorials/auto-layout'
              },
              {
                title: 'Export & Integration',
                duration: '8 min read',
                description: 'Export designs to CAD and integrate with BIM',
                link: '/tutorials/export-integration'
              }
            ].map((tutorial) => (
              <Link
                key={tutorial.title}
                href={tutorial.link}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <BookOpen className="w-8 h-8 text-gray-600" />
                  <span className="text-sm text-gray-500">{tutorial.duration}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                  {tutorial.title}
                </h3>
                <p className="text-gray-400 text-sm">{tutorial.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Design Like a Pro?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start creating professional lighting designs in minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/design/advanced"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-lg transition-colors"
            >
              Launch Advanced Designer
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