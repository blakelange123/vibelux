'use client';

import React, { useState } from 'react';
import {
  Dna,
  GitBranch,
  Calendar,
  Users,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  BarChart3,
  Microscope,
  Beaker,
  TreePine,
  Hash,
  Clock,
  ChevronRight,
  Plus,
  Edit,
  Copy
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Sankey } from 'recharts';

interface GeneticProfile {
  id: string;
  name: string;
  type: 'mother' | 'clone' | 'seed' | 'tissue_culture';
  genetics: {
    lineage: string[];
    dominantTerpenes: string[];
    cannabinoidProfile: {
      thc: { min: number; max: number; avg: number };
      cbd: { min: number; max: number; avg: number };
      cbg: { min: number; max: number; avg: number };
    };
    phenotypes: {
      name: string;
      frequency: number;
      characteristics: string[];
    }[];
  };
  cultivation: {
    flowerTime: number;
    yieldPotential: string;
    difficulty: 'easy' | 'medium' | 'hard';
    optimalEnvironment: {
      temp: { min: number; max: number };
      humidity: { min: number; max: number };
      vpd: { min: number; max: number };
    };
  };
  health: {
    vigor: number;
    diseaseResistance: number;
    pestResistance: number;
    stressResilience: number;
  };
  tracking: {
    source: string;
    acquisitionDate: Date;
    generations: number;
    totalClones: number;
    activeClones: number;
    lastPropagated: Date;
  };
}

interface PropagationEvent {
  id: string;
  parentId: string;
  type: 'clone' | 'seed' | 'tissue_culture';
  date: Date;
  quantity: number;
  successRate: number;
  location: string;
  technician: string;
  notes?: string;
}

interface GeneticTest {
  id: string;
  profileId: string;
  testType: 'cannabinoid' | 'terpene' | 'pathogen' | 'genetic_marker';
  date: Date;
  lab: string;
  results: any;
  certified: boolean;
}

export function GeneticTrackingSystem() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'lineage' | 'testing' | 'breeding'>('inventory');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'mother' | 'clone' | 'seed'>('all');

  // Genetic profiles in inventory
  const geneticProfiles: GeneticProfile[] = [
    {
      id: 'gen-001',
      name: 'Blue Dream #4',
      type: 'mother',
      genetics: {
        lineage: ['Blueberry', 'Haze'],
        dominantTerpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
        cannabinoidProfile: {
          thc: { min: 17, max: 24, avg: 20.5 },
          cbd: { min: 0.1, max: 0.3, avg: 0.2 },
          cbg: { min: 0.5, max: 1.2, avg: 0.8 }
        },
        phenotypes: [
          {
            name: 'Pheno #1 - Berry',
            frequency: 65,
            characteristics: ['Strong berry aroma', 'Purple hues', 'Dense buds']
          },
          {
            name: 'Pheno #2 - Haze',
            frequency: 35,
            characteristics: ['Citrus notes', 'Longer flowering', 'Higher yield']
          }
        ]
      },
      cultivation: {
        flowerTime: 63,
        yieldPotential: 'High (500-600g/m²)',
        difficulty: 'easy',
        optimalEnvironment: {
          temp: { min: 68, max: 78 },
          humidity: { min: 40, max: 55 },
          vpd: { min: 0.8, max: 1.2 }
        }
      },
      health: {
        vigor: 92,
        diseaseResistance: 85,
        pestResistance: 78,
        stressResilience: 88
      },
      tracking: {
        source: 'DNA Genetics',
        acquisitionDate: new Date('2023-06-15'),
        generations: 3,
        totalClones: 847,
        activeClones: 124,
        lastPropagated: new Date('2024-03-10')
      }
    },
    {
      id: 'gen-002',
      name: 'OG Kush Elite',
      type: 'mother',
      genetics: {
        lineage: ['ChemDawg', 'Hindu Kush'],
        dominantTerpenes: ['Limonene', 'Myrcene', 'Linalool'],
        cannabinoidProfile: {
          thc: { min: 20, max: 27, avg: 23.5 },
          cbd: { min: 0.05, max: 0.15, avg: 0.1 },
          cbg: { min: 0.8, max: 1.5, avg: 1.1 }
        },
        phenotypes: [
          {
            name: 'Pheno #1 - Gas',
            frequency: 80,
            characteristics: ['Fuel aroma', 'Rock hard buds', 'Heavy resin']
          },
          {
            name: 'Pheno #2 - Lemon',
            frequency: 20,
            characteristics: ['Citrus profile', 'Faster flowering', 'Stretchy']
          }
        ]
      },
      cultivation: {
        flowerTime: 65,
        yieldPotential: 'Medium-High (450-550g/m²)',
        difficulty: 'medium',
        optimalEnvironment: {
          temp: { min: 65, max: 75 },
          humidity: { min: 35, max: 50 },
          vpd: { min: 0.9, max: 1.3 }
        }
      },
      health: {
        vigor: 88,
        diseaseResistance: 82,
        pestResistance: 75,
        stressResilience: 90
      },
      tracking: {
        source: 'In-house selection',
        acquisitionDate: new Date('2022-03-20'),
        generations: 5,
        totalClones: 1243,
        activeClones: 186,
        lastPropagated: new Date('2024-03-15')
      }
    }
  ];

  // Propagation history
  const propagationEvents: PropagationEvent[] = [
    {
      id: 'prop-001',
      parentId: 'gen-001',
      type: 'clone',
      date: new Date('2024-03-10'),
      quantity: 48,
      successRate: 96,
      location: 'Propagation Room A',
      technician: 'Sarah M.',
      notes: 'Excellent rooting, ready for veg in 10 days'
    },
    {
      id: 'prop-002',
      parentId: 'gen-002',
      type: 'clone',
      date: new Date('2024-03-15'),
      quantity: 36,
      successRate: 94,
      location: 'Propagation Room B',
      technician: 'Mike T.',
      notes: 'Slight yellowing on lower leaves, adjusted nutrients'
    }
  ];

  // Genetic test results
  const geneticTests: GeneticTest[] = [
    {
      id: 'test-001',
      profileId: 'gen-001',
      testType: 'cannabinoid',
      date: new Date('2024-02-15'),
      lab: 'ProVerde Labs',
      results: {
        thc: 21.3,
        cbd: 0.2,
        cbg: 0.9,
        cbc: 0.4,
        thcv: 0.1
      },
      certified: true
    },
    {
      id: 'test-002',
      profileId: 'gen-001',
      testType: 'terpene',
      date: new Date('2024-02-15'),
      lab: 'ProVerde Labs',
      results: {
        myrcene: 1.82,
        pinene: 0.64,
        caryophyllene: 0.52,
        limonene: 0.38,
        linalool: 0.21
      },
      certified: true
    }
  ];

  // Lineage visualization data
  const lineageData = {
    nodes: [
      { id: 0, name: 'Blue Dream #4' },
      { id: 1, name: 'Blueberry' },
      { id: 2, name: 'Haze' },
      { id: 3, name: 'Afghani' },
      { id: 4, name: 'Thai' },
      { id: 5, name: 'Purple Thai' },
      { id: 6, name: 'Mexican' },
      { id: 7, name: 'Colombian' }
    ],
    links: [
      { source: 1, target: 0, value: 50 },
      { source: 2, target: 0, value: 50 },
      { source: 3, target: 1, value: 50 },
      { source: 4, target: 1, value: 25 },
      { source: 5, target: 1, value: 25 },
      { source: 6, target: 2, value: 33 },
      { source: 7, target: 2, value: 33 },
      { source: 4, target: 2, value: 34 }
    ]
  };

  const getHealthColor = (value: number) => {
    if (value >= 85) return 'text-green-400';
    if (value >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mother': return <TreePine className="w-5 h-5" />;
      case 'clone': return <Copy className="w-5 h-5" />;
      case 'seed': return <Beaker className="w-5 h-5" />;
      case 'tissue_culture': return <Microscope className="w-5 h-5" />;
      default: return <Dna className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Genetic Tracking System</h2>
          <p className="text-gray-400">Complete genetic inventory and lineage management</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Genetic
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Total Genetics</span>
            <Dna className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">24</p>
          <p className="text-sm text-gray-500">8 mothers, 16 strains</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Active Clones</span>
            <Users className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">486</p>
          <p className="text-sm text-gray-500">Across 12 strains</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Avg Success Rate</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">94.5%</p>
          <p className="text-sm text-gray-500">Propagation success</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Genetic Tests</span>
            <Beaker className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">68</p>
          <p className="text-sm text-gray-500">This quarter</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['inventory', 'lineage', 'testing', 'breeding'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <>
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search genetics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Types</option>
              <option value="mother">Mothers</option>
              <option value="clone">Clones</option>
              <option value="seed">Seeds</option>
            </select>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Genetic Profiles Grid */}
          <div className="grid grid-cols-2 gap-6">
            {geneticProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 cursor-pointer hover:border-purple-600 transition-colors"
                onClick={() => setSelectedProfile(profile.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      profile.type === 'mother' ? 'bg-purple-900/20 text-purple-400' :
                      profile.type === 'clone' ? 'bg-green-900/20 text-green-400' :
                      'bg-blue-900/20 text-blue-400'
                    }`}>
                      {getTypeIcon(profile.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{profile.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{profile.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Generation</p>
                    <p className="text-lg font-bold text-white">G{profile.tracking.generations}</p>
                  </div>
                </div>

                {/* Lineage */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Lineage</p>
                  <div className="flex items-center gap-2">
                    {profile.genetics.lineage.map((parent, idx) => (
                      <React.Fragment key={parent}>
                        <span className="text-sm text-gray-300">{parent}</span>
                        {idx < profile.genetics.lineage.length - 1 && (
                          <span className="text-gray-500">×</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Cannabinoid Profile */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400">THC</p>
                    <p className="text-lg font-bold text-white">{profile.genetics.cannabinoidProfile.thc.avg}%</p>
                    <p className="text-xs text-gray-500">
                      {profile.genetics.cannabinoidProfile.thc.min}-{profile.genetics.cannabinoidProfile.thc.max}%
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400">CBD</p>
                    <p className="text-lg font-bold text-white">{profile.genetics.cannabinoidProfile.cbd.avg}%</p>
                    <p className="text-xs text-gray-500">
                      {profile.genetics.cannabinoidProfile.cbd.min}-{profile.genetics.cannabinoidProfile.cbd.max}%
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400">CBG</p>
                    <p className="text-lg font-bold text-white">{profile.genetics.cannabinoidProfile.cbg.avg}%</p>
                    <p className="text-xs text-gray-500">
                      {profile.genetics.cannabinoidProfile.cbg.min}-{profile.genetics.cannabinoidProfile.cbg.max}%
                    </p>
                  </div>
                </div>

                {/* Health Indicators */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Vigor</p>
                    <p className={`text-sm font-bold ${getHealthColor(profile.health.vigor)}`}>
                      {profile.health.vigor}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Disease</p>
                    <p className={`text-sm font-bold ${getHealthColor(profile.health.diseaseResistance)}`}>
                      {profile.health.diseaseResistance}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Pest</p>
                    <p className={`text-sm font-bold ${getHealthColor(profile.health.pestResistance)}`}>
                      {profile.health.pestResistance}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Stress</p>
                    <p className={`text-sm font-bold ${getHealthColor(profile.health.stressResilience)}`}>
                      {profile.health.stressResilience}%
                    </p>
                  </div>
                </div>

                {/* Clone Status */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div>
                    <p className="text-sm text-gray-400">Active Clones</p>
                    <p className="text-lg font-bold text-white">{profile.tracking.activeClones}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Propagated</p>
                    <p className="text-lg font-bold text-white">{profile.tracking.totalClones}</p>
                  </div>
                  <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Propagation Events */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Propagation Events</h3>
            <div className="space-y-3">
              {propagationEvents.map((event) => {
                const profile = geneticProfiles.find(p => p.id === event.parentId);
                return (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-900/20 text-green-400 rounded-lg">
                        <Copy className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{profile?.name}</p>
                        <p className="text-sm text-gray-400">
                          {event.quantity} {event.type}s • {event.successRate}% success
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-300">{event.technician}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'lineage' && (
        <>
          {/* Lineage Visualization */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Genetic Lineage Map</h3>
            <div className="h-96 flex items-center justify-center">
              <p className="text-gray-400">
                Interactive lineage visualization would be rendered here using D3.js or similar
              </p>
            </div>
          </div>

          {/* Breeding History */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Breeding History</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">Blue Dream #4 Selection</h4>
                  <span className="text-sm text-gray-400">2023-06-15</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Selected from 120 seedlings for exceptional terpene profile and vigor
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">Parents:</span>
                  <span className="text-blue-400">Blueberry (DJ Short)</span>
                  <span className="text-gray-500">×</span>
                  <span className="text-green-400">Super Silver Haze</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'testing' && (
        <>
          {/* Test Results Summary */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Latest Cannabinoid Results</h3>
              <div className="space-y-3">
                {geneticTests
                  .filter(test => test.testType === 'cannabinoid')
                  .slice(0, 3)
                  .map((test) => {
                    const profile = geneticProfiles.find(p => p.id === test.profileId);
                    return (
                      <div key={test.id} className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-white">{profile?.name}</p>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400">THC</p>
                            <p className="text-white font-medium">{test.results.thc}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400">CBD</p>
                            <p className="text-white font-medium">{test.results.cbd}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400">CBG</p>
                            <p className="text-white font-medium">{test.results.cbg}%</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Terpene Profiles</h3>
              <div className="space-y-3">
                {geneticTests
                  .filter(test => test.testType === 'terpene')
                  .slice(0, 1)
                  .map((test) => {
                    const profile = geneticProfiles.find(p => p.id === test.profileId);
                    return (
                      <div key={test.id}>
                        <p className="font-medium text-white mb-3">{profile?.name}</p>
                        {Object.entries(test.results).map(([terpene, value]) => (
                          <div key={terpene} className="flex items-center justify-between py-1">
                            <span className="text-sm text-gray-400 capitalize">{terpene}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${(value as number / 2) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-white">{value}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Testing Schedule</h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <p className="font-medium text-yellow-300">Upcoming Tests</p>
                  </div>
                  <p className="text-sm text-gray-300">OG Kush Elite - Full panel</p>
                  <p className="text-xs text-gray-400 mt-1">Scheduled for March 25</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-white mb-1">Quarterly Testing</p>
                  <p className="text-xs text-gray-400">All mother plants due in 2 weeks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Test History Chart */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">THC Potency Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { month: 'Jan', blueDream: 20.1, ogKush: 22.8 },
                  { month: 'Feb', blueDream: 21.3, ogKush: 23.2 },
                  { month: 'Mar', blueDream: 20.8, ogKush: 23.5 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Line type="monotone" dataKey="blueDream" stroke="#3B82F6" strokeWidth={2} name="Blue Dream" />
                  <Line type="monotone" dataKey="ogKush" stroke="#10B981" strokeWidth={2} name="OG Kush" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'breeding' && (
        <>
          {/* Breeding Projects */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
            <h3 className="text-lg font-semibold text-white mb-4">Active Breeding Projects</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">Project: Frost King</h4>
                  <span className="px-2 py-1 bg-green-900/20 text-green-400 rounded-full text-xs">F2 Stage</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Breeding for enhanced trichome production and cold resistance
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">White Widow × Northern Lights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">48 plants in selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Started: Jan 15, 2024</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">Project: Citrus Express</h4>
                  <span className="px-2 py-1 bg-yellow-900/20 text-yellow-400 rounded-full text-xs">F1 Testing</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Fast-flowering citrus profile with high yield potential
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Lemon Haze × Critical Mass</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">24 plants in testing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Started: Feb 1, 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Breeding Goals */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Breeding Goals & Targets</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <Award className="w-6 h-6 text-yellow-400 mb-2" />
                <h4 className="font-medium text-white mb-2">Quality Enhancement</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Terpene complexity</li>
                  <li>• Trichome density</li>
                  <li>• Flavor profiles</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
                <h4 className="font-medium text-white mb-2">Production Efficiency</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Faster flowering</li>
                  <li>• Higher yields</li>
                  <li>• Compact structure</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <Shield className="w-6 h-6 text-blue-400 mb-2" />
                <h4 className="font-medium text-white mb-2">Resilience Traits</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Disease resistance</li>
                  <li>• Pest tolerance</li>
                  <li>• Climate adaptability</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}