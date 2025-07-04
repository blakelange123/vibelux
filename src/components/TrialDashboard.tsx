'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Download,
  Settings,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { Trial } from '@/types/trials';

interface TrialDashboardProps {
  trial: Trial;
  onBack: () => void;
  onUpdate: (updates: Partial<Trial>) => void;
}

export function TrialDashboard({ trial, onBack, onUpdate }: TrialDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'analysis' | 'reports'>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'RUNNING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'COMPLETED': return 'bg-green-500/20 text-green-500 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{trial.name}</h1>
              <p className="text-gray-400">{trial.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(trial.status)}`}>
              {trial.status.replace('_', ' ')}
            </div>
            
            <div className="flex bg-gray-800 rounded-lg overflow-hidden">
              <button className="p-2 text-green-400 hover:bg-gray-700">
                <Play className="w-4 h-4" />
              </button>
              <button className="p-2 text-yellow-400 hover:bg-gray-700">
                <Pause className="w-4 h-4" />
              </button>
              <button className="p-2 text-red-400 hover:bg-gray-700">
                <Square className="w-4 h-4" />
              </button>
            </div>
            
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'data', label: 'Data Collection', icon: BarChart3 },
            { id: 'analysis', label: 'Analysis', icon: TrendingUp },
            { id: 'reports', label: 'Reports', icon: Download }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Trial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold">Timeline</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Planned Start:</span>
                    <span>{trial.plannedStartDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Planned End:</span>
                    <span>{trial.plannedEndDate.toLocaleDateString()}</span>
                  </div>
                  {trial.actualStartDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Actual Start:</span>
                      <span>{trial.actualStartDate.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold">Design</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span>{trial.designType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Replicates:</span>
                    <span>{trial.experimentalDesign.replicates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Treatments:</span>
                    <span>{trial.treatments.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold">Team</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Principal:</span>
                    <span>You</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Collaborators:</span>
                    <span>{trial.collaborators.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hypothesis & Objectives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="font-semibold mb-3">Research Hypothesis</h3>
                <p className="text-gray-300">{trial.hypothesis}</p>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="font-semibold mb-3">Objectives</h3>
                <ul className="space-y-2">
                  {trial.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Statistical Parameters */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="font-semibold mb-4">Statistical Parameters</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Significance Level</div>
                  <div className="text-lg font-semibold">{trial.statisticalParams.significanceLevel}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Power</div>
                  <div className="text-lg font-semibold">{trial.statisticalParams.power}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Min Sample Size</div>
                  <div className="text-lg font-semibold">{trial.statisticalParams.minimumSampleSize}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Primary Analysis</div>
                  <div className="text-lg font-semibold">{trial.statisticalParams.primaryAnalysis}</div>
                </div>
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="font-semibold mb-4">Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Trial Completion</span>
                    <span className="text-sm text-gray-300">45%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Data Collection</span>
                    <span className="text-sm text-gray-300">60%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Data Collection Interface</h3>
            <p className="text-gray-500">
              Data entry forms and real-time collection monitoring coming soon
            </p>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Statistical Analysis</h3>
            <p className="text-gray-500">
              ANOVA results, power analysis, and effect size calculations coming soon
            </p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <Download className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Report Generation</h3>
            <p className="text-gray-500">
              Automated scientific reports and publication-ready outputs coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}