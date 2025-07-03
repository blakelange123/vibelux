'use client';

import Link from 'next/link';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Users, 
  Code,
  GraduationCap,
  Newspaper,
  HelpCircle,
  MessageSquare,
  Download,
  ExternalLink,
  ArrowRight,
  Calculator,
  Zap
} from 'lucide-react';

const resourceCategories = [
  {
    title: 'Calculators & Tools',
    description: 'Professional lighting and climate calculators',
    icon: Calculator,
    href: '/calculators',
    items: [
      { label: 'Lighting Design Studio', href: '/design' },
      { label: 'Advanced Design Studio', href: '/design/advanced' },
      { label: 'VPD Calculator', href: '/calculators/vpd' },
      { label: 'Climate Tools', href: '/climate-tools' }
    ],
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Energy & Sustainability',
    description: 'Analyze energy usage and environmental impact',
    icon: Zap,
    href: '/calculators/energy-moisture-balance',
    items: [
      { label: 'Energy & Moisture Balance', href: '/calculators/energy-moisture-balance' },
      { label: 'ROI Calculator', href: '/calculators/roi' },
      { label: 'Payback Calculator', href: '/calculators/payback' },
      { label: 'LED vs HPS Comparison', href: '/calculators/led-vs-hps' }
    ],
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Support',
    description: 'Get help when you need it',
    icon: HelpCircle,
    href: '/help',
    items: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Support', href: '/help/contact' },
      { label: 'System Status', href: '/help/status' },
      { label: 'FAQ', href: '/help/faq' }
    ],
    color: 'from-indigo-500 to-indigo-600'
  }
];

const featuredResources = [
  {
    title: 'Lighting Design Studio',
    type: 'Interactive Tool',
    description: 'Create professional lighting layouts',
    href: '/design',
    icon: Calculator
  },
  {
    title: 'VPD Calculator',
    type: 'Calculator',
    description: 'Optimize vapor pressure deficit',
    href: '/calculators/vpd',
    icon: Calculator
  },
  {
    title: 'Climate Analysis Tools',
    type: 'Tool Suite',
    description: 'HVAC sizing and environmental control',
    href: '/climate-tools',
    icon: Calculator
  },
  {
    title: 'Energy & Sustainability',
    type: 'Calculator',
    description: 'Analyze energy usage and costs',
    href: '/calculators/energy-moisture-balance',
    icon: Calculator
  }
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Resource Center</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Everything you need to master VibeLux - from comprehensive documentation to community support
          </p>
        </div>
      </div>

      {/* Quick Search */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 mb-12">
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search documentation, tutorials, and more..."
              className="flex-1 px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Resource Categories */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resourceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`h-2 bg-gradient-to-r ${category.color}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${category.color} rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Link href={category.href} className="text-gray-400 hover:text-white transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-gray-400 mb-4">{category.description}</p>
                  <div className="space-y-2">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between py-1 text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Resources */}
      <div className="bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredResources.map((resource) => {
              const Icon = resource.icon;
              return (
                <Link
                  key={resource.title}
                  href={resource.href}
                  className="bg-gray-900 rounded-lg p-6 hover:bg-gray-850 transition-colors group"
                >
                  <Icon className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">{resource.type}</p>
                  <p className="text-xs text-gray-500">
                    {resource.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/50 rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
              <p className="text-gray-300 mb-6">
                Jump directly to our most popular tools and calculators for immediate use.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/design" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                  <Calculator className="w-5 h-5" />
                  Lighting Designer
                </Link>
                <Link href="/calculators/vpd" className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Calculator className="w-5 h-5" />
                  VPD Calculator
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-purple-600/20 rounded-full">
                <Calculator className="w-16 h-16 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Need Help CTA */}
      <div className="bg-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <MessageSquare className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-gray-300 mb-6">
            Our support team is here to help. Reach out with any questions.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/help/contact"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/help"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}