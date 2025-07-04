'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Calculator,
  Lightbulb,
  Droplets,
  Thermometer,
  Wind,
  Leaf,
  Beaker,
  Battery,
  DollarSign,
  Clock,
  Play,
  BookOpen,
  Zap
} from 'lucide-react';

const calculatorCategories = [
  {
    title: 'Lighting Calculators',
    icon: Lightbulb,
    calculators: [
      'PPFD/DLI Calculator',
      'Fixture Spacing Optimizer',
      'Energy Cost Calculator',
      'Photoperiod Planner',
      'Spectrum Analyzer',
      'Light Degradation Estimator'
    ]
  },
  {
    title: 'Environmental Calculators',
    icon: Thermometer,
    calculators: [
      'VPD Calculator',
      'Psychrometric Chart',
      'Dew Point Calculator',
      'Heat Load Calculator',
      'Ventilation Requirements',
      'CO2 Enrichment Calculator'
    ]
  },
  {
    title: 'Irrigation & Nutrients',
    icon: Droplets,
    calculators: [
      'Nutrient Solution Mixer',
      'EC/PPM Converter',
      'pH Adjustment Calculator',
      'Water Volume Calculator',
      'Fertigation Scheduler',
      'Runoff Analysis Tool'
    ]
  },
  {
    title: 'Business & ROI',
    icon: DollarSign,
    calculators: [
      'ROI Calculator',
      'Energy Savings Estimator',
      'Yield Predictor',
      'Labor Cost Calculator',
      'Break-even Analysis',
      'TCO Comparison Tool'
    ]
  }
];

const features = [
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Get accurate calculations in real-time as you adjust inputs'
  },
  {
    icon: Battery,
    title: 'Save Calculations',
    description: 'Store and retrieve your calculations for future reference'
  },
  {
    icon: Beaker,
    title: 'Science-Based',
    description: 'All formulas verified by cultivation experts and researchers'
  },
  {
    icon: Clock,
    title: 'Historical Data',
    description: 'Track how your calculations change over time'
  }
];

export default function AdvancedCalculatorsFeaturePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-600/20 via-transparent to-transparent" />
        
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
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div className="px-4 py-2 bg-orange-500/20 rounded-full">
                <span className="text-sm font-medium text-orange-300">Scientific Tools</span>
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-6">
              Advanced Calculators
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Professional-grade calculators for every aspect of controlled environment agriculture. 
              From lighting design to nutrient mixing, get precise calculations backed by science.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/calculators"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors"
              >
                Open Calculator Suite
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors">
                <Play className="w-5 h-5" />
                Watch Tutorial
              </button>
            </div>

            <div className="mt-8 flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300">20+ Calculators</span>
              </div>
              <div className="flex items-center gap-2">
                <Beaker className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Science-Based</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Real-Time Results</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculator Categories */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comprehensive Calculator Suite
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {calculatorCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold">{category.title}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {category.calculators.map((calc) => (
                      <div key={calc} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-300">{calc}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Why Professionals Choose Our Calculators
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-6 text-center"
                >
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Calculators Showcase */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Most Popular Calculators</h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* PPFD/DLI Calculator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-8 h-8 text-yellow-400" />
                <h3 className="text-xl font-bold">PPFD/DLI Calculator</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Calculate optimal light intensity and daily light integral for any crop stage.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li>• Input fixture specifications</li>
                <li>• Calculate coverage area</li>
                <li>• Determine optimal heights</li>
                <li>• Export light maps</li>
              </ul>
              <Link
                href="/calculators/ppfd-dli"
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300"
              >
                Try Calculator <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* VPD Calculator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Wind className="w-8 h-8 text-blue-400" />
                <h3 className="text-xl font-bold">VPD Calculator</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Calculate vapor pressure deficit for optimal plant transpiration rates.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li>• Real-time VPD calculation</li>
                <li>• Leaf temperature offset</li>
                <li>• Growth stage recommendations</li>
                <li>• Environmental adjustments</li>
              </ul>
              <Link
                href="/calculators/vpd"
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300"
              >
                Try Calculator <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Nutrient Mixer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Beaker className="w-8 h-8 text-green-400" />
                <h3 className="text-xl font-bold">Nutrient Mixer</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Calculate precise nutrient solutions for any reservoir size and crop needs.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li>• Multi-part nutrient systems</li>
                <li>• EC/PPM targets</li>
                <li>• pH adjustment calculations</li>
                <li>• Save custom recipes</li>
              </ul>
              <Link
                href="/calculators/nutrient-mixer"
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300"
              >
                Try Calculator <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integration Features */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Seamless Integration with Your Workflow
          </h2>
          
          <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Data Import/Export</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Import sensor data directly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Export results as CSV or PDF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>API access for automation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Share calculations with team</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Smart Features</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Auto-save all calculations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Comparison mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Unit conversion built-in</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Mobile responsive design</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Resources */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Learn the Science</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Understanding PPFD & DLI',
                type: 'Article',
                duration: '8 min read',
                description: 'Deep dive into photosynthetic photon flux density'
              },
              {
                title: 'VPD Masterclass',
                type: 'Video',
                duration: '25 min',
                description: 'Complete guide to vapor pressure deficit'
              },
              {
                title: 'Nutrient Fundamentals',
                type: 'Course',
                duration: '2 hours',
                description: 'Everything about hydroponic nutrition'
              }
            ].map((resource) => (
              <div key={resource.title} className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <BookOpen className="w-8 h-8 text-gray-600" />
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">{resource.type}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{resource.description}</p>
                <p className="text-xs text-gray-500">{resource.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-900/20 to-red-900/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Calculate with Confidence
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of growers using our scientific calculators daily
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/calculators"
              className="px-8 py-4 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium text-lg transition-colors"
            >
              Access All Calculators
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium text-lg transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}