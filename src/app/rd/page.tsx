'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  Microscope,
  TrendingUp,
  Dna,
  BarChart3,
  Target,
  Lightbulb,
  BookOpen,
  Database,
  Beaker,
  Activity,
  Award
} from 'lucide-react';

export default function RDPage() {
  const modules = [
    {
      title: 'Experiment Management',
      description: 'Design, execute, and analyze experiments',
      icon: FlaskConical,
      href: '/rd/experiments',
      color: 'from-purple-600 to-purple-700',
      stats: { active: 12, completed: 89 }
    },
    {
      title: 'Cultivar Screening',
      description: 'Evaluate and select superior genetics',
      icon: Dna,
      href: '/rd/cultivars',
      color: 'from-green-600 to-green-700',
      stats: { tested: 156, selected: 23 }
    },
    {
      title: 'Process Optimization',
      description: 'Improve efficiency and reduce costs',
      icon: TrendingUp,
      href: '/rd/optimization',
      color: 'from-blue-600 to-blue-700',
      stats: { projects: 8, savings: '$124k' }
    },
    {
      title: 'Pathogen Testing',
      description: 'Disease detection and prevention',
      icon: Microscope,
      href: '/rd/pathogen-testing',
      color: 'from-red-600 to-red-700',
      stats: { tests: 342, detections: 12 }
    },
    {
      title: 'Data Analytics',
      description: 'Statistical analysis and insights',
      icon: BarChart3,
      href: '/rd/analytics',
      color: 'from-indigo-600 to-indigo-700',
      stats: { datasets: 456, models: 15 }
    },
    {
      title: 'Innovation Pipeline',
      description: 'Track R&D to production progress',
      icon: Lightbulb,
      href: '/rd/pipeline',
      color: 'from-yellow-600 to-yellow-700',
      stats: { ideas: 34, implemented: 8 }
    },
    {
      title: 'Knowledge Base',
      description: 'Research documentation and SOPs',
      icon: BookOpen,
      href: '/rd/knowledge',
      color: 'from-teal-600 to-teal-700',
      stats: { documents: 234, sops: 67 }
    },
    {
      title: 'Sample Management',
      description: 'Track samples and lab inventory',
      icon: Beaker,
      href: '/rd/samples',
      color: 'from-orange-600 to-orange-700',
      stats: { active: 89, archived: 567 }
    }
  ];

  const activeExperiments = [
    {
      title: 'Airflow Optimization - Leafy Greens',
      type: 'Environmental',
      progress: 75,
      daysLeft: 12,
      potential: '+10% yield'
    },
    {
      title: 'Red Lettuce Color Enhancement',
      type: 'Lighting',
      progress: 45,
      daysLeft: 28,
      potential: '+25% anthocyanin'
    },
    {
      title: 'Spinach Disease Resistance',
      type: 'Genetics',
      progress: 60,
      daysLeft: 45,
      potential: '90% reduction'
    },
    {
      title: 'Nutrient Efficiency Trial',
      type: 'Nutrition',
      progress: 30,
      daysLeft: 35,
      potential: '-15% cost'
    }
  ];

  const recentFindings = [
    {
      date: '2024-03-14',
      finding: 'Discovered 50 µmol PPFD increase improves basil oil content by 18%',
      impact: 'High',
      status: 'Validating'
    },
    {
      date: '2024-03-12',
      finding: 'Identified optimal VPD range 1.2-1.4 kPa for spinach germination',
      impact: 'Medium',
      status: 'Implemented'
    },
    {
      date: '2024-03-10',
      finding: 'New cultivar BL-2024-03 shows 25% faster growth rate',
      impact: 'High',
      status: 'Scaling'
    }
  ];

  const innovationMetrics = {
    r2dCycleTime: 84, // days
    successRate: 68, // %
    roiMultiple: 3.2,
    implementationRate: 78 // %
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <FlaskConical className="w-10 h-10 text-purple-400" />
            Research & Development
          </h1>
          <p className="text-gray-400 text-lg">
            Drive innovation through data-driven experimentation and continuous improvement
          </p>
        </div>

        {/* Innovation Metrics */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-600/30 mb-8">
          <h3 className="text-xl font-semibold mb-4">Innovation Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-purple-400">{innovationMetrics.r2dCycleTime}</div>
              <div className="text-sm text-gray-400">Days to Production</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">{innovationMetrics.successRate}%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">{innovationMetrics.roiMultiple}x</div>
              <div className="text-sm text-gray-400">Average ROI</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">{innovationMetrics.implementationRate}%</div>
              <div className="text-sm text-gray-400">Implementation Rate</div>
            </div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={module.href}>
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 hover:border-gray-600 transition-all cursor-pointer group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="relative">
                    <module.icon className="w-8 h-8 mb-4 text-gray-400 group-hover:text-white transition-colors" />
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {module.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      {Object.entries(module.stats).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500 capitalize">{key}: </span>
                          <span className="text-gray-300 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Experiments */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Active Experiments
            </h3>
            <div className="space-y-4">
              {activeExperiments.map((exp, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{exp.title}</h4>
                      <p className="text-sm text-gray-400">{exp.type}</p>
                    </div>
                    <span className="text-sm text-green-400 font-medium">
                      {exp.potential}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-gray-400">{exp.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${exp.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {exp.daysLeft} days remaining
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Findings */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" />
              Recent Findings
            </h3>
            <div className="space-y-4">
              {recentFindings.map((finding, index) => (
                <div key={index} className="pb-4 border-b border-gray-700 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs text-gray-500">{finding.date}</div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      finding.status === 'Implemented' ? 'bg-green-900/30 text-green-400' :
                      finding.status === 'Scaling' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {finding.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{finding.finding}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${
                      finding.impact === 'High' ? 'text-red-400' :
                      finding.impact === 'Medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {finding.impact} Impact
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <FlaskConical className="w-6 h-6" />
              <span className="text-sm">New Experiment</span>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <Database className="w-6 h-6" />
              <span className="text-sm">Log Results</span>
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Run Analysis</span>
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <Target className="w-6 h-6" />
              <span className="text-sm">Set Targets</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}