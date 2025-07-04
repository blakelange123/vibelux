"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  Award,
  Plane,
  Wrench,
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Clock,
  Users,
  BarChart3,
  Zap,
  ChevronRight,
  DollarSign,
  Calendar,
  Info,
  Database,
  Lightbulb
} from 'lucide-react'

interface ServiceModule {
  id: string
  name: string
  icon: any
  description: string
  features: string[]
  pricing: {
    monthly: number
    annual: number
    setup?: number
  }
  benefits: string[]
  category: 'certification' | 'automation' | 'maintenance' | 'compliance' | 'lighting'
  popular?: boolean
}

const serviceModules: ServiceModule[] = [
  {
    id: 'certification',
    name: 'GlobalG.A.P. Certification Assistant',
    icon: Award,
    description: 'Achieve and maintain international food safety certification with ease',
    features: [
      'Compliance requirement tracking',
      'Document management system',
      'Audit preparation tools',
      'Training resources library',
      'Real-time compliance scoring',
      'Automated reminder system'
    ],
    pricing: {
      monthly: 299,
      annual: 2990,
      setup: 500
    },
    benefits: [
      'Access premium markets',
      'Reduce audit preparation time by 75%',
      'Ensure continuous compliance',
      'Minimize certification costs'
    ],
    category: 'certification'
  },
  {
    id: 'autopilot',
    name: 'Auto Pilot System',
    icon: Plane,
    description: 'AI-powered autonomous cultivation management for optimal yields',
    features: [
      'Machine learning optimization',
      'Automated environmental control',
      'Predictive analytics',
      'Custom cultivation profiles',
      'Real-time adjustments',
      'Performance monitoring'
    ],
    pricing: {
      monthly: 499,
      annual: 4990
    },
    benefits: [
      'Increase yields by 15-20%',
      'Reduce labor costs by 40%',
      'Minimize human error',
      '24/7 autonomous operation'
    ],
    category: 'automation',
    popular: true
  },
  {
    id: 'maintenance',
    name: 'Light System Calibration & Maintenance',
    icon: Wrench,
    description: 'Predictive maintenance to ensure optimal light output and longevity',
    features: [
      'Fixture performance tracking',
      'Calibration scheduling',
      'Degradation monitoring',
      'Service contract management',
      'Maintenance history',
      'ROI analysis tools'
    ],
    pricing: {
      monthly: 199,
      annual: 1990
    },
    benefits: [
      'Extend fixture lifespan by 30%',
      'Maintain optimal PPFD levels',
      'Reduce emergency repairs',
      'Maximize light efficiency'
    ],
    category: 'maintenance'
  },
  {
    id: 'metrc',
    name: 'METRC Integration',
    icon: Database,
    description: 'Complete seed-to-sale tracking and compliance for cannabis cultivation',
    features: [
      'Real-time METRC API integration',
      'Plant tracking and tagging',
      'Compliance monitoring',
      'Yield correlation analysis',
      'Automated reporting',
      'Audit preparation tools'
    ],
    pricing: {
      monthly: 399,
      annual: 3990,
      setup: 750
    },
    benefits: [
      'Ensure 100% compliance',
      'Reduce manual data entry by 90%',
      'Optimize yields based on tracking data',
      'Pass audits with confidence'
    ],
    category: 'compliance'
  },
  {
    id: 'spectrum',
    name: 'Advanced Spectrum Control',
    icon: Lightbulb,
    description: 'Color-tunable fixtures with energy-optimized deep red modulation',
    features: [
      'Dynamic spectral control',
      'Deep red energy optimization',
      'Utility API integration',
      'Peak hour modulation',
      'DLI target maintenance',
      'Energy cost monitoring'
    ],
    pricing: {
      monthly: 349,
      annual: 3490
    },
    benefits: [
      'Reduce energy costs by 25%',
      'Maintain target DLI efficiency',
      'Optimize for utility rates',
      'Smart peak-hour management'
    ],
    category: 'lighting',
    popular: true
  }
]

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'certification' | 'automation' | 'maintenance' | 'compliance' | 'lighting'>('all')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')

  const filteredModules = selectedCategory === 'all' 
    ? serviceModules 
    : serviceModules.filter(m => m.category === selectedCategory)

  const calculateSavings = (module: ServiceModule) => {
    if (!module.pricing.annual || !module.pricing.monthly) return 0
    const annualEquivalent = module.pricing.monthly * 12
    return Math.round(((annualEquivalent - module.pricing.annual) / annualEquivalent) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-900/20 via-gray-900 to-gray-950 py-20">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Premium Service Modules
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Beyond Hardware: Complete Solutions
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Transform your cultivation facility with AI-powered automation, certification management, 
              and predictive maintenance services designed to maximize efficiency and profitability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cultivation"
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                Explore All Features
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors border border-gray-700"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {(['all', 'certification', 'automation', 'maintenance', 'compliance', 'lighting'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 rounded transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1 rounded transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400'
                }`}
              >
                Annual
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Modules Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredModules.map((module) => {
              const Icon = module.icon
              const savings = calculateSavings(module)
              
              return (
                <div
                  key={module.id}
                  className={`relative bg-gray-900 rounded-xl border ${
                    module.popular ? 'border-purple-600' : 'border-gray-800'
                  } p-6 hover:border-gray-700 transition-all`}
                >
                  {module.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-purple-600 text-white text-sm font-medium rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${
                        module.category === 'certification' ? 'bg-green-500/20' :
                        module.category === 'automation' ? 'bg-purple-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        <Icon className={`w-8 h-8 ${
                          module.category === 'certification' ? 'text-green-400' :
                          module.category === 'automation' ? 'text-purple-400' :
                          'text-blue-400'
                        }`} />
                      </div>
                      {savings > 0 && billingCycle === 'annual' && (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                          Save {savings}%
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-2">{module.name}</h3>
                    <p className="text-gray-400 text-sm">{module.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-3xl font-bold text-white">
                        ${billingCycle === 'monthly' ? module.pricing.monthly : Math.round(module.pricing.annual / 12)}
                      </span>
                      <span className="text-gray-400">/month</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-sm text-gray-500">
                        ${module.pricing.annual} billed annually
                      </p>
                    )}
                    {module.pricing.setup && (
                      <p className="text-sm text-gray-500 mt-1">
                        + ${module.pricing.setup} one-time setup
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <h4 className="text-sm font-medium text-white">Features:</h4>
                    {module.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                    {module.features.length > 4 && (
                      <p className="text-sm text-gray-500">
                        + {module.features.length - 4} more features
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/cultivation?tab=${module.id}`}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    Learn More
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose Vibelux Services?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our service modules integrate seamlessly with your existing Vibelux system 
              to provide comprehensive cultivation management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-lg mb-4">
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Proven ROI</h3>
              <p className="text-gray-400">
                Average payback period of 6-12 months with measurable improvements in yield and efficiency
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-lg mb-4">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Always Compliant</h3>
              <p className="text-gray-400">
                Stay ahead of regulations with automated compliance tracking and certification management
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-lg mb-4">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
              <p className="text-gray-400">
                Expert support team available around the clock to ensure your operations run smoothly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Facility?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start with a free consultation to identify the service modules that will 
            deliver the greatest impact for your operation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Schedule Consultation
            </Link>
            <Link
              href="/calculators/roi"
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Calculate Your ROI
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}