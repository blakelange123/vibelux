'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FlaskConical, BarChart3, FileText, Database, Brain,
  Calculator, Activity, TrendingUp, Download, ExternalLink,
  Filter, Search, Clock, Users, Award, BookOpen,
  LineChart, PieChart, Microscope, Beaker
} from 'lucide-react';

interface ResearchTool {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: any;
  link: string;
  features: string[];
  isNew?: boolean;
  isPremium?: boolean;
}

const researchTools: ResearchTool[] = [
  {
    id: 'statistical-analysis',
    title: 'Statistical Analysis Suite',
    description: 'Advanced statistical tools for analyzing experimental data, including ANOVA, regression, and multivariate analysis.',
    category: 'Analysis',
    icon: BarChart3,
    link: '/research/statistical-analysis',
    features: ['ANOVA', 'Regression Analysis', 'Data Visualization', 'Export Results'],
    isPremium: true
  },
  {
    id: 'experiment-designer',
    title: 'Experiment Designer',
    description: 'Design and plan controlled experiments with randomization, blocking, and factorial designs.',
    category: 'Planning',
    icon: FlaskConical,
    link: '/research/experiment-designer',
    features: ['Randomized Designs', 'Factorial Experiments', 'Sample Size Calculator', 'Protocol Builder']
  },
  {
    id: 'data-logger',
    title: 'Research Data Logger',
    description: 'Comprehensive data collection system for research trials with mobile and sensor integration.',
    category: 'Collection',
    icon: Database,
    link: '/research/data-logger',
    features: ['Mobile Data Entry', 'Sensor Integration', 'Offline Mode', 'Data Validation']
  },
  {
    id: 'literature-review',
    title: 'Literature Review Assistant',
    description: 'AI-powered tool to search, organize, and summarize scientific literature relevant to your research.',
    category: 'Research',
    icon: BookOpen,
    link: '/research/literature-review',
    features: ['Paper Search', 'Citation Management', 'AI Summaries', 'Reference Export'],
    isNew: true
  },
  {
    id: 'crop-modeling',
    title: 'Crop Growth Modeling',
    description: 'Predictive models for crop growth under various environmental conditions.',
    category: 'Modeling',
    icon: LineChart,
    link: '/research/crop-modeling',
    features: ['Growth Prediction', 'Yield Estimation', 'Climate Scenarios', 'Parameter Optimization']
  },
  {
    id: 'nutrient-calculator',
    title: 'Advanced Nutrient Calculator',
    description: 'Research-grade nutrient solution calculator with custom formulation capabilities.',
    category: 'Calculators',
    icon: Beaker,
    link: '/research/nutrient-calculator',
    features: ['Custom Formulas', 'Ion Balance', 'pH Prediction', 'Recipe Scaling']
  },
  {
    id: 'phenotyping',
    title: 'Digital Phenotyping',
    description: 'Image-based plant phenotyping and trait measurement system.',
    category: 'Measurement',
    icon: Microscope,
    link: '/research/phenotyping',
    features: ['Image Analysis', 'Trait Detection', 'Growth Tracking', '3D Reconstruction'],
    isPremium: true
  },
  {
    id: 'climate-simulator',
    title: 'Climate Chamber Simulator',
    description: 'Simulate and test various climate conditions for research protocols.',
    category: 'Simulation',
    icon: Activity,
    link: '/research/climate-simulator',
    features: ['VPD Control', 'Light Recipes', 'CO2 Enrichment', 'Protocol Export']
  }
];

const categories = ['All', 'Analysis', 'Planning', 'Collection', 'Research', 'Modeling', 'Calculators', 'Measurement', 'Simulation'];

export default function ResearchPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = researchTools.filter(tool => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <span className="text-white">Research Tools</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Research & Analysis Tools</h1>
              <p className="text-gray-400">Professional tools for agricultural research and experimentation</p>
            </div>
            <Link
              href="/research/my-experiments"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200"
            >
              My Experiments
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">1,250+</div>
                  <div className="text-sm text-gray-400">Research Projects</div>
                </div>
                <FlaskConical className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">85%</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">450+</div>
                  <div className="text-sm text-gray-400">Publications</div>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-sm text-gray-400">Universities</div>
                </div>
                <Award className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search research tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-gray-900/50 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-200 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <tool.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex gap-2">
                    {tool.isNew && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                        NEW
                      </span>
                    )}
                    {tool.isPremium && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                        PRO
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {tool.description}
                </p>

                <div className="space-y-2 mb-6">
                  {tool.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Link
                  href={tool.link}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors font-medium"
                >
                  Open Tool
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Research */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Research Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
              <div className="flex items-start gap-4">
                <Brain className="w-8 h-8 text-purple-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Yield Prediction</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Machine learning models trained on 50,000+ grow cycles to predict yields with 92% accuracy.
                  </p>
                  <Link href="/research/ai-yield-prediction" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                    Learn more →
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/20">
              <div className="flex items-start gap-4">
                <Activity className="w-8 h-8 text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Optimal Light Recipes Study</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Research on spectral optimization across different growth stages.
                  </p>
                  <Link href="/research/light-recipes" className="text-green-400 hover:text-green-300 text-sm font-medium">
                    View results →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gray-900/50 rounded-xl p-8 border border-white/10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Your Research?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Join thousands of researchers using VibeLux tools to advance agricultural science. 
            Get access to professional-grade analysis tools and collaborate with experts worldwide.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/research/experiment-designer"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200"
            >
              Start New Experiment
            </Link>
            <Link
              href="/research/tutorials"
              className="px-6 py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
            >
              View Tutorials
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}