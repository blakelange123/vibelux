'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  BarChart3,
  TrendingUp,
  PieChart,
  LineChart,
  Calendar,
  FileText,
  Download,
  Share2,
  Clock,
  Target,
  Zap,
  Eye
} from 'lucide-react';

const features = [
  {
    icon: LineChart,
    title: 'Real-Time Dashboards',
    description: 'Monitor KPIs with customizable dashboards updated every minute'
  },
  {
    icon: TrendingUp,
    title: 'Trend Analysis',
    description: 'Identify patterns and optimize based on historical performance'
  },
  {
    icon: PieChart,
    title: 'Comparative Analytics',
    description: 'Compare performance across rooms, strains, and time periods'
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set targets and monitor progress with automated alerts'
  },
  {
    icon: FileText,
    title: 'Custom Reports',
    description: 'Generate detailed reports for stakeholders and compliance'
  },
  {
    icon: Share2,
    title: 'Data Export',
    description: 'Export data in multiple formats for further analysis'
  }
];

const metrics = [
  {
    category: 'Yield Metrics',
    items: [
      'Grams per square foot',
      'Grams per watt',
      'Harvest weight trends',
      'Quality grade distribution'
    ]
  },
  {
    category: 'Environmental Performance',
    items: [
      'Temperature stability',
      'VPD consistency',
      'Light intensity distribution',
      'CO2 utilization efficiency'
    ]
  },
  {
    category: 'Resource Efficiency',
    items: [
      'Energy consumption per gram',
      'Water usage efficiency',
      'Nutrient uptake rates',
      'Labor hours per harvest'
    ]
  },
  {
    category: 'Financial Analytics',
    items: [
      'Cost per gram',
      'Revenue per square foot',
      'ROI by cultivation area',
      'Operational expense trends'
    ]
  }
];

export default function PerformanceAnalyticsFeaturePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent" />
        
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
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div className="px-4 py-2 bg-purple-500/20 rounded-full">
                <span className="text-sm font-medium text-purple-300">Analytics & Intelligence</span>
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-6">
              Performance Analytics
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Transform your cultivation data into actionable insights. Track every metric that 
              matters and make data-driven decisions to optimize yield, quality, and profitability.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/analytics"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                Open Analytics Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors">
                <Eye className="w-5 h-5" />
                View Demo Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden bg-gray-800 aspect-video"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Analytics Dashboard Preview</p>
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
            Comprehensive Analytics Platform
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
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Metrics Tracked */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Track Every Metric That Matters</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((category) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-purple-400 mb-4">{category.category}</h3>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Intelligent Insights</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    AI-Powered Recommendations
                  </h3>
                  <p className="text-gray-400">
                    Our machine learning algorithms analyze your data to provide actionable 
                    recommendations for improving yield, reducing costs, and optimizing operations.
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Predictive Analytics
                  </h3>
                  <p className="text-gray-400">
                    Forecast future performance based on historical trends, environmental conditions, 
                    and cultivation practices to make proactive decisions.
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    Benchmarking
                  </h3>
                  <p className="text-gray-400">
                    Compare your performance against industry standards and anonymous peer data 
                    to identify improvement opportunities.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Reporting & Integration</h2>
              
              <div className="bg-purple-900/20 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Automated Reporting</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                    <span>Schedule daily, weekly, or monthly reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-purple-400 mt-0.5" />
                    <span>Customizable report templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Share2 className="w-5 h-5 text-purple-400 mt-0.5" />
                    <span>Automatic distribution to stakeholders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Download className="w-5 h-5 text-purple-400 mt-0.5" />
                    <span>Export in PDF, Excel, or CSV formats</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Data Sources</h3>
                <p className="text-gray-400 mb-4">
                  Aggregate data from all your systems for unified insights:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {['Environmental sensors', 'Light controllers', 'Irrigation systems', 
                    'Harvest data', 'Labor tracking', 'Financial systems'].map((source) => (
                    <div key={source} className="bg-gray-700 rounded px-3 py-2 text-gray-300">
                      {source}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ROI Impact */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Proven Impact on Operations</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">23%</div>
              <p className="text-gray-400">Average yield increase</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-4xl font-bold text-green-400 mb-2">35%</div>
              <p className="text-gray-400">Reduction in resource waste</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-4xl font-bold text-blue-400 mb-2">4.5x</div>
              <p className="text-gray-400">ROI in first year</p>
            </div>
          </div>

          <blockquote className="text-xl text-gray-300 italic">
            "The analytics platform helped us identify inefficiencies we didn't even know existed. 
            We've increased our yield by 30% while reducing energy costs by 25%."
          </blockquote>
          <p className="text-gray-400 mt-2">- Michael Rodriguez, Operations Director</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Turn Your Data Into Competitive Advantage
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start making data-driven decisions today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/analytics"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium text-lg transition-colors"
            >
              Launch Analytics Platform
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium text-lg transition-colors"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}