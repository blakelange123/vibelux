'use client';

import React, { useState, useEffect } from 'react';
import {
  Beaker,
  Plus,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Users,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  PlayCircle,
  PauseCircle,
  FileText,
  Download,
  Eye,
  Edit3,
  Trash2,
  Copy
} from 'lucide-react';
import { TrialDesignWizard } from './TrialDesignWizard';
import { TrialDashboard } from './TrialDashboard';
import { Trial, TrialStatus, TrialCategory } from '@/types/trials';

interface TrialsManagerProps {
  className?: string;
}

export function TrialsManager({ className = '' }: TrialsManagerProps) {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'dashboard' | 'analytics'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrialStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<TrialCategory | 'ALL'>('ALL');

  // Mock data - in practice this would come from an API
  useEffect(() => {
    const mockTrials: Trial[] = [
      {
        id: '1',
        name: 'Far-Red Spectrum Analysis',
        description: 'Testing the effect of far-red light on microgreens yield',
        userId: 'user1',
        status: 'RUNNING',
        designType: 'FACTORIAL',
        hypothesis: 'Far-red light will increase yield by 15%',
        objectives: ['Measure yield increase', 'Analyze energy efficiency'],
        experimentalDesign: {
          type: 'FACTORIAL',
          factors: [],
          replicates: 4,
          randomization: { method: 'SIMPLE' },
          controls: []
        },
        treatments: [],
        measurements: [],
        statisticalParams: {
          significanceLevel: 0.05,
          power: 0.8,
          minimumSampleSize: 16,
          primaryAnalysis: 'FACTORIAL_ANOVA',
          secondaryAnalyses: []
        },
        plannedStartDate: new Date('2024-01-15'),
        plannedEndDate: new Date('2024-02-15'),
        actualStartDate: new Date('2024-01-15'),
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-20'),
        tags: ['microgreens', 'lighting', 'spectrum'],
        collaborators: []
      },
      {
        id: '2',
        name: 'Light Intensity Optimization',
        description: 'Optimizing PPFD levels for maximum energy efficiency',
        userId: 'user1',
        status: 'PLANNING',
        designType: 'COMPLETELY_RANDOMIZED',
        hypothesis: '120 μmol/m²/s will provide optimal yield-to-energy ratio',
        objectives: ['Determine optimal PPFD', 'Calculate ROI for different intensities'],
        experimentalDesign: {
          type: 'COMPLETELY_RANDOMIZED',
          factors: [],
          replicates: 4,
          randomization: { method: 'SIMPLE' },
          controls: []
        },
        treatments: [],
        measurements: [],
        statisticalParams: {
          significanceLevel: 0.05,
          power: 0.8,
          minimumSampleSize: 16,
          primaryAnalysis: 'ANOVA',
          secondaryAnalyses: []
        },
        plannedStartDate: new Date('2024-02-01'),
        plannedEndDate: new Date('2024-03-01'),
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25'),
        tags: ['intensity', 'optimization', 'energy'],
        collaborators: []
      },
      {
        id: '3',
        name: 'Substrate Comparison Study',
        description: 'Comparing different growing substrates for leafy greens',
        userId: 'user1',
        status: 'COMPLETED',
        designType: 'RANDOMIZED_BLOCK',
        hypothesis: 'Rockwool will outperform coconut coir for germination rate',
        objectives: ['Compare germination rates', 'Analyze cost-effectiveness'],
        experimentalDesign: {
          type: 'RANDOMIZED_BLOCK',
          factors: [],
          replicates: 6,
          randomization: { method: 'BLOCK' },
          controls: []
        },
        treatments: [],
        measurements: [],
        statisticalParams: {
          significanceLevel: 0.05,
          power: 0.8,
          minimumSampleSize: 24,
          primaryAnalysis: 'ANOVA',
          secondaryAnalyses: []
        },
        plannedStartDate: new Date('2023-12-01'),
        plannedEndDate: new Date('2023-12-30'),
        actualStartDate: new Date('2023-12-01'),
        actualEndDate: new Date('2023-12-28'),
        createdAt: new Date('2023-11-25'),
        updatedAt: new Date('2023-12-30'),
        tags: ['substrate', 'germination', 'cost'],
        collaborators: []
      }
    ];
    setTrials(mockTrials);
  }, []);

  // Filter trials based on search and filters
  const filteredTrials = trials.filter(trial => {
    const matchesSearch = trial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trial.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || trial.status === statusFilter;
    
    const matchesCategory = categoryFilter === 'ALL' || 
                           trial.tags.some(tag => tag.toLowerCase().includes(categoryFilter.toLowerCase()));
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateTrial = (trialData: Partial<Trial>) => {
    const newTrial: Trial = {
      id: Date.now().toString(),
      userId: 'current-user',
      status: 'PLANNING',
      createdAt: new Date(),
      updatedAt: new Date(),
      collaborators: [],
      ...trialData
    } as Trial;
    
    setTrials(prev => [newTrial, ...prev]);
    setShowWizard(false);
  };

  const getStatusIcon = (status: TrialStatus) => {
    switch (status) {
      case 'PLANNING': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'RUNNING': return <PlayCircle className="w-4 h-4 text-blue-400" />;
      case 'DATA_COLLECTION': return <BarChart3 className="w-4 h-4 text-purple-400" />;
      case 'ANALYSIS': return <TrendingUp className="w-4 h-4 text-indigo-400" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CANCELLED': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TrialStatus) => {
    switch (status) {
      case 'PLANNING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'APPROVED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'RUNNING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'DATA_COLLECTION': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'ANALYSIS': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'COMPLETED': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (selectedTrial && viewMode === 'dashboard') {
    return (
      <TrialDashboard
        trial={selectedTrial}
        onBack={() => {
          setSelectedTrial(null);
          setViewMode('list');
        }}
        onUpdate={(updates) => {
          setTrials(prev => prev.map(t => 
            t.id === selectedTrial.id ? { ...t, ...updates } : t
          ));
          setSelectedTrial(prev => prev ? { ...prev, ...updates } : null);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${className}`}>
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Beaker className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold">Statistical Trials</h1>
              <p className="text-gray-400">Design, manage, and analyze controlled experiments</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 text-sm ${
                  viewMode === 'analytics' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Analytics
              </button>
            </div>
            
            <button
              onClick={() => setShowWizard(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Trial
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search trials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TrialStatus | 'ALL')}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="APPROVED">Approved</option>
            <option value="RUNNING">Running</option>
            <option value="DATA_COLLECTION">Data Collection</option>
            <option value="ANALYSIS">Analysis</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as TrialCategory | 'ALL')}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="LIGHTING_OPTIMIZATION">Lighting</option>
            <option value="SPECTRUM_TUNING">Spectrum</option>
            <option value="ENVIRONMENTAL_CONTROL">Environment</option>
            <option value="NUTRITION_OPTIMIZATION">Nutrition</option>
            <option value="VARIETY_COMPARISON">Varieties</option>
            <option value="CULTIVATION_METHOD">Cultivation</option>
            <option value="ENERGY_EFFICIENCY">Energy</option>
            <option value="AUTOMATION_TESTING">Automation</option>
          </select>

          {/* Results count */}
          <div className="text-sm text-gray-400">
            {filteredTrials.length} of {trials.length} trials
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {viewMode === 'list' && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Beaker className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{trials.length}</div>
                  <div className="text-sm text-gray-400">Total Trials</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {trials.filter(t => t.status === 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <PlayCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {trials.filter(t => ['RUNNING', 'DATA_COLLECTION', 'ANALYSIS'].includes(t.status)).length}
                  </div>
                  <div className="text-sm text-gray-400">Active</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {trials.filter(t => ['PLANNING', 'APPROVED'].includes(t.status)).length}
                  </div>
                  <div className="text-sm text-gray-400">Planned</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trials List */}
          <div className="space-y-4">
            {filteredTrials.map((trial) => (
              <div
                key={trial.id}
                className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{trial.name}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${getStatusColor(trial.status)}`}>
                        {getStatusIcon(trial.status)}
                        {trial.status.replace('_', ' ')}
                      </div>
                    </div>
                    
                    <p className="text-gray-400 mb-3">{trial.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {trial.plannedStartDate.toLocaleDateString()} - {trial.plannedEndDate.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {trial.designType.replace('_', ' ')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {trial.collaborators.length + 1} collaborator(s)
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {trial.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedTrial(trial);
                        setViewMode('dashboard');
                      }}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="View Dashboard"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Edit Trial"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    <button
                      className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Clone Trial"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <button
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Download Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Delete Trial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTrials.length === 0 && (
            <div className="text-center py-12">
              <Beaker className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No trials found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                  ? 'Try adjusting your search criteria'
                  : 'Create your first trial to get started with statistical analysis'
                }
              </p>
              {!searchTerm && statusFilter === 'ALL' && categoryFilter === 'ALL' && (
                <button
                  onClick={() => setShowWizard(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Trial
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="p-6">
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500">
              Cross-trial analytics and insights coming soon
            </p>
          </div>
        </div>
      )}

      {/* Trial Design Wizard */}
      {showWizard && (
        <TrialDesignWizard
          onTrialCreate={handleCreateTrial}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}