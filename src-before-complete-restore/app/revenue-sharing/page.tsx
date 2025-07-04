'use client';

import React, { useState } from 'react';
import { RevenueSharingDashboard } from '@/components/RevenueSharingDashboard';
import { PerformanceDashboard } from '@/components/revenue-sharing/PerformanceDashboard';
import { BaselineManager } from '@/components/revenue-sharing/BaselineManager';
import { AutomatedBilling } from '@/components/revenue-sharing/AutomatedBilling';
import { DataCollection } from '@/components/revenue-sharing/DataCollection';
import { 
  LayoutDashboard, 
  Database, 
  CreditCard, 
  Activity,
  TrendingUp,
  Settings,
  FileText,
  Info,
  Home
} from 'lucide-react';

export default function RevenueSharingPage() {
  const [activeView, setActiveView] = useState<'overview' | 'performance' | 'baseline' | 'billing' | 'data'>('overview');

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home, color: 'text-purple-400' },
    { id: 'performance', label: 'Performance', icon: TrendingUp, color: 'text-green-400' },
    { id: 'baseline', label: 'Baselines', icon: Database, color: 'text-blue-400' },
    { id: 'billing', label: 'Billing', icon: CreditCard, color: 'text-purple-400' },
    { id: 'data', label: 'Data Collection', icon: Activity, color: 'text-orange-400' }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-purple-500" />
                Revenue Sharing Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Track performance, manage baselines, and monitor billing</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <FileText className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                  activeView === item.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <item.icon className={`w-4 h-4 ${activeView === item.id ? item.color : ''}`} />
                {item.label}
                {activeView === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info Banner - Only show on first visit */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-600/30 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <p className="font-medium text-white mb-1">Welcome to Revenue Sharing</p>
              <p className="text-sm text-gray-300">
                This dashboard helps you track savings, manage performance baselines, and handle automated billing. 
                Start by setting up your baselines in the Baselines tab, then monitor your real-time performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {activeView === 'overview' && <RevenueSharingDashboard />}
        {activeView === 'performance' && <PerformanceDashboard />}
        {activeView === 'baseline' && <BaselineManager />}
        {activeView === 'billing' && <AutomatedBilling />}
        {activeView === 'data' && <DataCollection />}
      </div>
    </div>
  );
}