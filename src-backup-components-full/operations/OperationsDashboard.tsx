'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  TrendingUp,
  CheckSquare,
  AlertTriangle,
  ChevronRight,
  Activity,
  Users,
  DollarSign,
  Zap,
  FileText,
  Package,
  BarChart3,
  Brain,
  Cpu,
  Dna,
  Network,
  Battery,
  Upload,
  Gauge,
  Monitor
} from 'lucide-react';
import { MobileTaskView } from './MobileTaskView';
import { useMobile } from '@/hooks/useMobile';

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export function OperationsDashboard() {
  const pathname = usePathname();
  const { isMobile } = useMobile();
  
  // Check if we're on the overview page
  const isOverview = pathname === '/operations';

  const quickStats: QuickStat[] = [
    {
      label: 'Cost per Gram',
      value: '$1.85',
      change: '-8%',
      trend: 'down',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: 'Yield per Sq Ft',
      value: '65.3g',
      change: '+12%',
      trend: 'up',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      label: 'Active Tasks',
      value: '14',
      change: '3 critical',
      trend: 'neutral',
      icon: <CheckSquare className="w-5 h-5" />
    },
    {
      label: 'Active Alerts',
      value: '3',
      change: '78% risk',
      trend: 'down',
      icon: <AlertTriangle className="w-5 h-5" />
    }
  ];

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Quick insights and metrics',
      href: '/operations'
    },
    {
      id: 'hmi',
      label: 'HMI Control',
      icon: <Gauge className="w-5 h-5" />,
      description: 'Real-time equipment monitoring & control',
      href: '/operations/hmi'
    },
    {
      id: 'insights',
      label: 'Operational Insights',
      icon: <Activity className="w-5 h-5" />,
      description: 'Environmental impact on business outcomes',
      href: '/operations/insights'
    },
    {
      id: 'tasks',
      label: 'Task Management',
      icon: <CheckSquare className="w-5 h-5" />,
      description: 'Environment-triggered task automation',
      href: '/operations/tasks'
    },
    {
      id: 'alerts',
      label: 'Predictive Alerts',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'AI-powered issue prevention',
      href: '/operations/alerts'
    },
    {
      id: 'compliance',
      label: 'Compliance & Reporting',
      icon: <FileText className="w-5 h-5" />,
      description: 'Regulatory tracking and reports',
      href: '/operations/compliance'
    },
    {
      id: 'resources',
      label: 'Resource Planning',
      icon: <Users className="w-5 h-5" />,
      description: 'Staff and resource optimization',
      href: '/operations/resources'
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-5 h-5" />,
      description: 'Supply and equipment tracking',
      href: '/operations/inventory'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Unified performance insights',
      href: '/operations/analytics'
    },
    {
      id: 'cultivation',
      label: 'Cultivation Insights',
      icon: <Brain className="w-5 h-5" />,
      description: 'AI-powered cultivation intelligence',
      href: '/operations/cultivation'
    },
    {
      id: 'automation',
      label: 'Automation Control',
      icon: <Cpu className="w-5 h-5" />,
      description: 'Facility automation management',
      href: '/operations/automation'
    },
    {
      id: 'integration',
      label: 'System Integration',
      icon: <Network className="w-5 h-5" />,
      description: 'Infrastructure and data flow visualization',
      href: '/operations/integration'
    },
    {
      id: 'energy',
      label: 'Energy Optimization',
      icon: <Battery className="w-5 h-5" />,
      description: 'Power monitoring and optimization',
      href: '/operations/energy'
    },
    {
      id: 'genetics',
      label: 'Genetic Tracking',
      icon: <Dna className="w-5 h-5" />,
      description: 'Strain management and lineage tracking',
      href: '/operations/genetics'
    },
    {
      id: 'data-import',
      label: 'Data Import',
      icon: <Upload className="w-5 h-5" />,
      description: 'Import historical data for instant insights',
      href: '/operations/data-import'
    }
  ];

  // Show mobile task view if on tasks page
  if (isMobile && pathname === '/operations/tasks') {
    return <MobileTaskView />;
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Operations Center</h1>
          <p className="text-gray-400">Unified operational intelligence for your cultivation facility</p>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`p-4 rounded-lg border transition-all text-left block ${
                  isActive
                    ? 'bg-purple-900/20 border-purple-600'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${
                    isActive ? 'bg-purple-600' : 'bg-gray-800'
                  }`}>
                    {item.icon}
                  </div>
                  <ChevronRight className={`w-5 h-5 ${
                    isActive ? 'text-purple-400' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className="font-semibold text-white mt-3">{item.label}</h3>
                <p className="text-sm text-gray-400 mt-1">{item.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Content Area - Only show on overview page */}
        {isOverview && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {quickStats.map((stat, idx) => (
                <div key={idx} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">{stat.label}</span>
                    <div className={`p-2 rounded-lg ${
                      stat.trend === 'up' ? 'bg-green-900/20 text-green-400' :
                      stat.trend === 'down' ? 'bg-red-900/20 text-red-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.trend === 'up' ? 'text-green-400' :
                    stat.trend === 'down' && stat.label.includes('Cost') ? 'text-green-400' :
                    stat.trend === 'down' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              ))}
            </div>

            {/* HMI Quick Access */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">HMI Control Center</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Live</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-sm text-gray-400">Active Equipment</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">8</p>
                  <p className="text-sm text-gray-400">Running</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">2</p>
                  <p className="text-sm text-gray-400">Warnings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">0</p>
                  <p className="text-sm text-gray-400">Critical</p>
                </div>
              </div>
              <Link 
                href="/operations/hmi" 
                className="block w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Monitor className="w-5 h-5" />
                Open HMI Control Panel
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-gray-300">Light height adjustment completed in Flower A</p>
                  <span className="text-sm text-gray-500 ml-auto">2 min ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <p className="text-gray-300">Spider mite risk alert generated for Room B</p>
                  <span className="text-sm text-gray-500 ml-auto">15 min ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <p className="text-gray-300">Weekly IPM inspection scheduled</p>
                  <span className="text-sm text-gray-500 ml-auto">1 hour ago</span>
                </div>
              </div>
            </div>

            {/* Key Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Facility Health Score</h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#374151"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#10B981"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56 * 0.72} ${2 * Math.PI * 56}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">72</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Environmental</span>
                        <span className="text-sm font-medium text-yellow-400">72%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Equipment</span>
                        <span className="text-sm font-medium text-green-400">85%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Pest/Disease</span>
                        <span className="text-sm font-medium text-red-400">45%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Yield Track</span>
                        <span className="text-sm font-medium text-green-400">88%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Worker Performance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        JD
                      </div>
                      <div>
                        <p className="text-white font-medium">John D.</p>
                        <p className="text-xs text-gray-400">45 tasks completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-medium">112%</p>
                      <p className="text-xs text-gray-400">efficiency</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        SM
                      </div>
                      <div>
                        <p className="text-white font-medium">Sarah M.</p>
                        <p className="text-xs text-gray-400">52 tasks completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-medium">98%</p>
                      <p className="text-xs text-gray-400">efficiency</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
                  <Zap className="w-6 h-6 text-yellow-400 mb-2" />
                  <p className="font-medium text-white">Run Efficiency Report</p>
                  <p className="text-sm text-gray-400 mt-1">Generate weekly metrics</p>
                </button>
                <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
                  <Users className="w-6 h-6 text-blue-400 mb-2" />
                  <p className="font-medium text-white">Schedule Training</p>
                  <p className="text-sm text-gray-400 mt-1">Improve team performance</p>
                </button>
                <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
                  <Activity className="w-6 h-6 text-green-400 mb-2" />
                  <p className="font-medium text-white">Optimize Settings</p>
                  <p className="text-sm text-gray-400 mt-1">AI recommendations</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}