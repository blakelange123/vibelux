'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileCheck,
  AlertTriangle,
  FlaskConical,
  Award,
  TrendingUp,
  Users,
  FileText,
  ClipboardCheck,
  Activity,
  Package,
  Shield,
  BarChart3
} from 'lucide-react';

export default function QualityManagementPage() {
  const modules = [
    {
      title: 'Document Control',
      description: 'SOPs, work instructions, and quality documents',
      icon: FileText,
      href: '/quality/documents',
      color: 'from-blue-600 to-blue-700',
      stats: { active: 124, pending: 8 }
    },
    {
      title: 'CAPA Management',
      description: 'Corrective and preventive actions tracking',
      icon: AlertTriangle,
      href: '/quality/capa',
      color: 'from-orange-600 to-orange-700',
      stats: { open: 12, overdue: 3 }
    },
    {
      title: 'Lab Results & COAs',
      description: 'Test results and certificates of analysis',
      icon: FlaskConical,
      href: '/quality/lab-results',
      color: 'from-purple-600 to-purple-700',
      stats: { tests: 456, passed: '94%' }
    },
    {
      title: 'Deviations',
      description: 'Track and investigate quality deviations',
      icon: Activity,
      href: '/quality/deviations',
      color: 'from-red-600 to-red-700',
      stats: { active: 5, critical: 1 }
    },
    {
      title: 'Change Control',
      description: 'Manage process and system changes',
      icon: ClipboardCheck,
      href: '/quality/change-control',
      color: 'from-teal-600 to-teal-700',
      stats: { pending: 7, approved: 23 }
    },
    {
      title: 'Supplier Management',
      description: 'Vendor qualification and scorecards',
      icon: Users,
      href: '/quality/suppliers',
      color: 'from-indigo-600 to-indigo-700',
      stats: { approved: 34, audits: 5 }
    },
    {
      title: 'Product Specifications',
      description: 'Quality standards and release criteria',
      icon: Package,
      href: '/quality/specifications',
      color: 'from-green-600 to-green-700',
      stats: { products: 28, versions: 156 }
    },
    {
      title: 'Quality Metrics',
      description: 'KPIs, trends, and analytics',
      icon: BarChart3,
      href: '/quality/metrics',
      color: 'from-pink-600 to-pink-700',
      stats: { kpis: 15, reports: 42 }
    }
  ];

  const recentActivity = [
    { type: 'deviation', message: 'Critical deviation DEV-2024-0145 created', time: '10 min ago', severity: 'critical' },
    { type: 'capa', message: 'CAPA-2024-0089 approved by QA Manager', time: '45 min ago', severity: 'info' },
    { type: 'test', message: 'Lab results received for Batch #B240315', time: '2 hours ago', severity: 'success' },
    { type: 'audit', message: 'Supplier audit scheduled for ABC Nutrients', time: '3 hours ago', severity: 'warning' },
    { type: 'doc', message: 'SOP-CULT-003 due for annual review', time: '5 hours ago', severity: 'warning' }
  ];

  const upcomingTasks = [
    { task: 'Review and approve CC-2024-0034', due: 'Today', priority: 'high' },
    { task: 'Complete CAPA effectiveness check', due: 'Tomorrow', priority: 'medium' },
    { task: 'Conduct monthly supplier scorecard review', due: 'Mar 20', priority: 'medium' },
    { task: 'Prepare for state inspection', due: 'Mar 25', priority: 'critical' },
    { task: 'Update quality manual v2.1', due: 'Mar 30', priority: 'low' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Shield className="w-10 h-10 text-green-400" />
            Quality Management System
          </h1>
          <p className="text-gray-400 text-lg">
            Ensure compliance, track quality metrics, and maintain GMP standards
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Quality Score</span>
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">94.2%</div>
            <div className="text-sm text-gray-500">+2.1% from last month</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Open CAPAs</span>
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-red-400">3 overdue</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Test Pass Rate</span>
              <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">96.5%</div>
            <div className="text-sm text-gray-500">Last 30 days</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Audit Ready</span>
              <FileCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">Yes</div>
            <div className="text-sm text-gray-500">All docs current</div>
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

        {/* Recent Activity and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-700 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.severity === 'critical' ? 'bg-red-500' :
                    activity.severity === 'warning' ? 'bg-yellow-500' :
                    activity.severity === 'success' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-400" />
              Upcoming Tasks
            </h3>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-start justify-between gap-3 pb-3 border-b border-gray-700 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{task.task}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {task.due}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.priority === 'critical' ? 'bg-red-900/50 text-red-400' :
                    task.priority === 'high' ? 'bg-orange-900/50 text-orange-400' :
                    task.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="mt-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-600/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Compliance Status
              </h3>
              <p className="text-gray-400">
                All quality systems operational. Next state inspection in 12 days.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">100%</div>
              <div className="text-sm text-gray-500">Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}