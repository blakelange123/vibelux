'use client';

import React, { useState } from 'react';
import { 
  FileText, Download, Eye, Sparkles, BarChart3, DollarSign, 
  TrendingUp, Shield, Award, Star, ArrowRight, Palette,
  Layout, Zap, CheckCircle
} from 'lucide-react';

interface ReportExample {
  id: string;
  title: string;
  description: string;
  category: string;
  features: string[];
  preview: string;
  color: string;
}

const REPORT_EXAMPLES: ReportExample[] = [
  {
    id: 'investment-analysis',
    title: 'Investment Due Diligence Report',
    description: 'Comprehensive financial analysis with AI-powered insights and professional formatting',
    category: 'Financial Analysis',
    features: [
      'Executive Summary with Key Metrics',
      'Revenue Analysis & Projections',
      'Risk Assessment Matrix',
      'Investment Recommendations',
      'Professional Charts & Visualizations',
      'Branded Cover Page & Layout'
    ],
    preview: '/api/placeholder/600/400',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'tco-analysis',
    title: 'Total Cost of Ownership Report',
    description: 'Detailed cost analysis with 10-year projections and ROI calculations',
    category: 'Cost Analysis',
    features: [
      'Complete Cost Breakdown',
      'CAPEX vs OPEX Analysis',
      '10-Year Financial Projections',
      'ROI & Payback Calculations',
      'Scenario Modeling',
      'Industry Benchmarking'
    ],
    preview: '/api/placeholder/600/400',
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'technical-specs',
    title: 'Technical Specification Document',
    description: 'Detailed technical documentation with system specifications and compliance data',
    category: 'Technical Documentation',
    features: [
      'System Architecture Overview',
      'Detailed Specifications Table',
      'Performance Metrics',
      'Compliance Documentation',
      'Installation Guidelines',
      'Maintenance Schedules'
    ],
    preview: '/api/placeholder/600/400',
    color: 'from-green-600 to-emerald-600'
  }
];

const DESIGN_FEATURES = [
  {
    icon: Palette,
    title: 'Custom Branding',
    description: 'Personalized color schemes, logos, and corporate styling'
  },
  {
    icon: Layout,
    title: 'Professional Layouts',
    description: 'Multiple layout options: Corporate, Modern, Minimal'
  },
  {
    icon: BarChart3,
    title: 'Advanced Visualizations',
    description: 'Charts, graphs, heatmaps, and interactive data displays'
  },
  {
    icon: Shield,
    title: 'Security & Compliance',
    description: 'Confidentiality levels and compliance documentation'
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Claude AI analyzes data and generates intelligent recommendations'
  },
  {
    icon: Award,
    title: 'Export Flexibility',
    description: 'PDF, Word, HTML, and Excel export options'
  }
];

export function ReportShowcase() {
  const [selectedExample, setSelectedExample] = useState(REPORT_EXAMPLES[0]);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Professional Reports
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Transform your data into stunning, professional reports with AI-powered insights, 
              custom branding, and enterprise-grade formatting that impresses clients and stakeholders.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                View Examples
              </button>
              <button className="px-8 py-4 border border-gray-600 rounded-xl font-semibold hover:border-gray-400 transition-colors flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Samples
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Features</h2>
          <p className="text-gray-400 text-lg">
            Every report includes professional features that make your data shine
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DESIGN_FEATURES.map((feature, index) => (
            <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Report Examples */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Report Templates</h2>
          <p className="text-gray-400 text-lg">
            Professional templates for every business need
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template List */}
          <div className="space-y-4">
            {REPORT_EXAMPLES.map((example) => (
              <button
                key={example.id}
                onClick={() => setSelectedExample(example)}
                className={`w-full text-left p-6 rounded-xl border transition-all duration-200 ${
                  selectedExample.id === example.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${example.color}`}></div>
                  <span className="text-sm font-medium text-purple-400">{example.category}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{example.title}</h3>
                <p className="text-gray-400 text-sm">{example.description}</p>
              </button>
            ))}
          </div>

          {/* Selected Template Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
              {/* Preview Image */}
              <div className={`h-64 bg-gradient-to-br ${selectedExample.color} flex items-center justify-center`}>
                <div className="text-center">
                  <FileText className="w-16 h-16 text-white/80 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white">{selectedExample.title}</h3>
                  <p className="text-white/80 mt-2">Professional Report Preview</p>
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">{selectedExample.title}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowPreview(true)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Generate
                    </button>
                  </div>
                </div>

                <p className="text-gray-400 mb-6">{selectedExample.description}</p>

                <div>
                  <h4 className="font-semibold mb-3">Included Features:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedExample.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-12 border border-purple-500/20">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Professional Reports?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Start generating stunning, professional reports that impress your clients and stakeholders. 
            Choose from our templates or create custom reports tailored to your needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Start Creating Reports
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 border border-gray-600 rounded-xl font-semibold hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              View Documentation
            </button>
          </div>
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Before vs After</h2>
          <p className="text-gray-400 text-lg">
            See the difference professional formatting makes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Before */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="bg-red-900/20 border-b border-red-500/20 p-4">
              <h3 className="font-semibold text-red-400">❌ Basic Report</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-gray-700 h-4 rounded w-3/4"></div>
                <div className="bg-gray-700 h-3 rounded w-1/2"></div>
                <div className="bg-gray-700 h-3 rounded w-2/3"></div>
                <div className="bg-gray-700 h-20 rounded"></div>
                <div className="bg-gray-700 h-3 rounded w-1/3"></div>
              </div>
              <div className="mt-6 text-sm text-gray-400">
                <ul className="space-y-1">
                  <li>• Plain text formatting</li>
                  <li>• No branding or colors</li>
                  <li>• Basic tables and data</li>
                  <li>• Limited export options</li>
                </ul>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="bg-gray-800/50 rounded-xl border border-purple-500 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
              <h3 className="font-semibold text-white">✨ Professional Report</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded w-3/4"></div>
                <div className="bg-blue-500 h-3 rounded w-1/2"></div>
                <div className="bg-green-500 h-3 rounded w-2/3"></div>
                <div className="bg-gradient-to-r from-blue-500 to-green-500 h-20 rounded flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="bg-purple-500 h-3 rounded w-1/3"></div>
              </div>
              <div className="mt-6 text-sm text-green-400">
                <ul className="space-y-1">
                  <li>• Custom branding & colors</li>
                  <li>• Professional charts & graphs</li>
                  <li>• AI-powered insights</li>
                  <li>• Multiple export formats</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}