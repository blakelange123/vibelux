'use client';

import React, { useState, useEffect } from 'react';
import {
  Scissors, Scale, Package, TrendingUp, Calendar, MapPin,
  User, Clock, Camera, BarChart3, Target, Zap, Award,
  CheckCircle, AlertTriangle, Plus, Edit3, Trash2,
  Download, RefreshCw, Filter, Search, Eye, Hash,
  Leaf, Bug, ThermometerSun, Droplets, Activity
} from 'lucide-react';

interface HarvestBatch {
  id: string;
  batchNumber: string;
  strain: string;
  plantCount: number;
  roomZone: string;
  plantedDate: Date;
  harvestDate: Date;
  estimatedYield: number; // grams
  actualYield?: number;
  yieldPerPlant: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  trimmer: {
    id: string;
    name: string;
    efficiency: number; // grams/hour
  };
  qualityMetrics: {
    moisture: number;
    trichomeColoration: 'clear' | 'cloudy' | 'amber';
    budDensity: 'loose' | 'medium' | 'dense';
    terpeneProfile: string[];
    defects: string[];
  };
  status: 'harvesting' | 'drying' | 'curing' | 'testing' | 'complete';
  photos: string[];
  notes: string;
  dryWeight?: number;
  curedWeight?: number;
  wastage: {
    trim: number;
    larf: number;
    defective: number;
  };
}

interface YieldPrediction {
  batchId: string;
  currentWeek: number;
  totalWeeks: number;
  predictedYield: number;
  confidence: number;
  factors: {
    environmentalScore: number;
    plantHealth: number;
    historicalData: number;
    currentGrowth: number;
  };
  recommendations: string[];
  riskFactors: string[];
}

interface StrainPerformance {
  strain: string;
  batches: number;
  avgYieldPerPlant: number;
  avgGrade: string;
  consistency: number;
  timeToHarvest: number; // days
  defectRate: number;
  marketValue: number;
}

export default function HarvestTracker({ facilityId }: { facilityId: string }) {
  const [activeTab, setActiveTab] = useState<'current' | 'predictions' | 'analytics' | 'strains'>('current');
  const [currentBatches, setCurrentBatches] = useState<HarvestBatch[]>([]);
  const [predictions, setPredictions] = useState<YieldPrediction[]>([]);
  const [strainPerformance, setStrainPerformance] = useState<StrainPerformance[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<HarvestBatch | null>(null);
  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHarvestData();
  }, [facilityId]);

  const loadHarvestData = async () => {
    // Mock data - in production, fetch from API
    const mockBatches: HarvestBatch[] = [
      {
        id: 'batch-1',
        batchNumber: 'VB-2024-001',
        strain: 'Purple Punch',
        plantCount: 48,
        roomZone: 'Flower Room 1',
        plantedDate: new Date(Date.now() - 63 * 24 * 60 * 60 * 1000),
        harvestDate: new Date(),
        estimatedYield: 2400,
        actualYield: 2280,
        yieldPerPlant: 47.5,
        grade: 'A',
        trimmer: {
          id: 'trimmer-1',
          name: 'Maria Rodriguez',
          efficiency: 45
        },
        qualityMetrics: {
          moisture: 62,
          trichomeColoration: 'cloudy',
          budDensity: 'dense',
          terpeneProfile: ['Myrcene', 'Limonene', 'Caryophyllene'],
          defects: []
        },
        status: 'harvesting',
        photos: ['/harvest-1.jpg', '/harvest-2.jpg'],
        notes: 'Excellent trichome development, perfect harvest timing',
        wastage: {
          trim: 380,
          larf: 120,
          defective: 45
        }
      },
      {
        id: 'batch-2',
        batchNumber: 'VB-2024-002',
        strain: 'Gelato',
        plantCount: 36,
        roomZone: 'Flower Room 2',
        plantedDate: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
        harvestDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        estimatedYield: 1980,
        yieldPerPlant: 55,
        grade: 'A+',
        trimmer: {
          id: 'trimmer-2',
          name: 'James Wilson',
          efficiency: 38
        },
        qualityMetrics: {
          moisture: 68,
          trichomeColoration: 'cloudy',
          budDensity: 'dense',
          terpeneProfile: ['Caryophyllene', 'Limonene', 'Myrcene'],
          defects: []
        },
        status: 'drying',
        photos: ['/harvest-3.jpg'],
        notes: 'Premium quality batch, excellent coloration',
        dryWeight: 1750,
        wastage: {
          trim: 420,
          larf: 85,
          defective: 20
        }
      }
    ];

    const mockPredictions: YieldPrediction[] = [
      {
        batchId: 'batch-3',
        currentWeek: 6,
        totalWeeks: 9,
        predictedYield: 2150,
        confidence: 0.89,
        factors: {
          environmentalScore: 92,
          plantHealth: 88,
          historicalData: 91,
          currentGrowth: 85
        },
        recommendations: [
          'Maintain current nutrient schedule',
          'Monitor for early harvest indicators in week 8',
          'Increase air circulation in final 2 weeks'
        ],
        riskFactors: [
          'Slight humidity increase detected',
          'One plant showing early senescence'
        ]
      }
    ];

    const mockStrainPerformance: StrainPerformance[] = [
      {
        strain: 'Purple Punch',
        batches: 8,
        avgYieldPerPlant: 46.2,
        avgGrade: 'A',
        consistency: 0.94,
        timeToHarvest: 63,
        defectRate: 0.03,
        marketValue: 2800
      },
      {
        strain: 'Gelato',
        batches: 6,
        avgYieldPerPlant: 52.8,
        avgGrade: 'A+',
        consistency: 0.91,
        timeToHarvest: 58,
        defectRate: 0.01,
        marketValue: 3200
      },
      {
        strain: 'Wedding Cake',
        batches: 5,
        avgYieldPerPlant: 44.1,
        avgGrade: 'A',
        consistency: 0.87,
        timeToHarvest: 65,
        defectRate: 0.05,
        marketValue: 2950
      }
    ];

    setCurrentBatches(mockBatches);
    setPredictions(mockPredictions);
    setStrainPerformance(mockStrainPerformance);
  };

  const handleStartHarvest = (batchId: string) => {
    setCurrentBatches(batches => 
      batches.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'harvesting' as const }
          : batch
      )
    );
  };

  const handleCompleteHarvest = (batchId: string, actualYield: number) => {
    setCurrentBatches(batches => 
      batches.map(batch => 
        batch.id === batchId 
          ? { 
              ...batch, 
              status: 'drying' as const,
              actualYield,
              yieldPerPlant: actualYield / batch.plantCount
            }
          : batch
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'harvesting': return 'text-orange-500 bg-orange-500/10';
      case 'drying': return 'text-yellow-500 bg-yellow-500/10';
      case 'curing': return 'text-blue-500 bg-blue-500/10';
      case 'testing': return 'text-purple-500 bg-purple-500/10';
      case 'complete': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-500 bg-green-500/10';
      case 'A': return 'text-blue-500 bg-blue-500/10';
      case 'B+': return 'text-yellow-500 bg-yellow-500/10';
      case 'B': return 'text-orange-500 bg-orange-500/10';
      case 'C': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const calculateVariance = (actual: number, estimated: number) => {
    return ((actual - estimated) / estimated) * 100;
  };

  const filteredBatches = currentBatches.filter(batch => {
    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      batch.strain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scissors className="w-7 h-7 text-green-400" />
            Harvest Tracker & Yield Analytics
          </h1>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHarvestForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Harvest
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-gray-700">
          {(['current', 'predictions', 'analytics', 'strains'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 border-b-2 transition-colors capitalize font-medium ${
                activeTab === tab
                  ? 'border-green-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'current' && 'Current Harvests'}
              {tab === 'predictions' && 'Yield Predictions'}
              {tab === 'analytics' && 'Analytics'}
              {tab === 'strains' && 'Strain Performance'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'current' && (
        <>
          {/* Filters */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search batches, strains..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="harvesting">Harvesting</option>
                <option value="drying">Drying</option>
                <option value="curing">Curing</option>
                <option value="testing">Testing</option>
                <option value="complete">Complete</option>
              </select>
            </div>
          </div>

          {/* Current Batches */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBatches.map(batch => (
              <div key={batch.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{batch.strain}</h3>
                      <p className="text-sm text-gray-400">{batch.batchNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(batch.grade)}`}>
                        {batch.grade}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs">Location</span>
                      </div>
                      <p className="text-white font-medium">{batch.roomZone}</p>
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Package className="w-4 h-4" />
                        <span className="text-xs">Plants</span>
                      </div>
                      <p className="text-white font-medium">{batch.plantCount}</p>
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Scale className="w-4 h-4" />
                        <span className="text-xs">Yield/Plant</span>
                      </div>
                      <p className="text-white font-medium">{batch.yieldPerPlant.toFixed(1)}g</p>
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-xs">Trimmer</span>
                      </div>
                      <p className="text-white font-medium">{batch.trimmer.name}</p>
                    </div>
                  </div>

                  {/* Yield Comparison */}
                  {batch.actualYield && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400">Yield vs Estimate</span>
                        <span className={`font-medium ${
                          calculateVariance(batch.actualYield, batch.estimatedYield) >= 0 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          {calculateVariance(batch.actualYield, batch.estimatedYield) >= 0 ? '+' : ''}
                          {calculateVariance(batch.actualYield, batch.estimatedYield).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (batch.actualYield / batch.estimatedYield) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Actual: {batch.actualYield}g</span>
                        <span>Est: {batch.estimatedYield}g</span>
                      </div>
                    </div>
                  )}

                  {/* Quality Metrics */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Quality Metrics</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-900 rounded p-2">
                        <span className="text-gray-500">Moisture</span>
                        <p className="text-white font-medium">{batch.qualityMetrics.moisture}%</p>
                      </div>
                      <div className="bg-gray-900 rounded p-2">
                        <span className="text-gray-500">Trichomes</span>
                        <p className="text-white font-medium capitalize">{batch.qualityMetrics.trichomeColorization}</p>
                      </div>
                      <div className="bg-gray-900 rounded p-2">
                        <span className="text-gray-500">Density</span>
                        <p className="text-white font-medium capitalize">{batch.qualityMetrics.budDensity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {batch.status === 'harvesting' && (
                      <button
                        onClick={() => handleCompleteHarvest(batch.id, batch.estimatedYield * 0.95)}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedBatch(batch)}
                      className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                    
                    <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                      <Camera className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {predictions.map(prediction => (
            <div key={prediction.batchId} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  Yield Prediction Analysis
                </h2>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Confidence</p>
                  <p className="text-2xl font-bold text-white">{Math.round(prediction.confidence * 100)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Progress */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-3">Growing Progress</h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Week {prediction.currentWeek} of {prediction.totalWeeks}</span>
                      <span className="text-white">{Math.round((prediction.currentWeek / prediction.totalWeeks) * 100)}%</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(prediction.currentWeek / prediction.totalWeeks) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{prediction.predictedYield}g</p>
                    <p className="text-sm text-gray-400">Predicted Yield</p>
                  </div>
                </div>

                {/* Factors */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-3">Prediction Factors</h3>
                  <div className="space-y-3">
                    {Object.entries(prediction.factors).map(([factor, score]) => (
                      <div key={factor}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400 capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-white">{score}%</span>
                        </div>
                        <div className="bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              score >= 90 ? 'bg-green-500' : 
                              score >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-green-300 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-green-200">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-300 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Factors
                  </h3>
                  <ul className="space-y-2">
                    {prediction.riskFactors.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-yellow-200">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'strains' && (
        <div className="space-y-6">
          {/* Strain Performance Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Leaf className="w-6 h-6 text-green-400" />
                Strain Performance Analytics
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Strain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Batches</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg Yield/Plant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Consistency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Days to Harvest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Market Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {strainPerformance.map(strain => (
                    <tr key={strain.strain} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{strain.strain}</div>
                        <div className="text-sm text-gray-400">{strain.defectRate.toFixed(1)}% defect rate</div>
                      </td>
                      <td className="px-6 py-4 text-white">{strain.batches}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{strain.avgYieldPerPlant.toFixed(1)}g</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(strain.avgGrade)}`}>
                          {strain.avgGrade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-700 rounded-full h-2 w-16">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${strain.consistency * 100}%` }}
                            />
                          </div>
                          <span className="text-white text-sm">{Math.round(strain.consistency * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white">{strain.timeToHarvest} days</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">${strain.marketValue.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">per lb</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Key Metrics */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Scale className="w-8 h-8 text-green-500" />
              <span className="text-xs text-gray-500">This Month</span>
            </div>
            <p className="text-3xl font-bold text-white">12.4kg</p>
            <p className="text-sm text-gray-400">Total Harvest</p>
            <p className="text-sm text-green-400 mt-1">+23% vs last month</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <span className="text-xs text-gray-500">Average</span>
            </div>
            <p className="text-3xl font-bold text-white">48.7g</p>
            <p className="text-sm text-gray-400">Yield per Plant</p>
            <p className="text-sm text-blue-400 mt-1">+5.2g vs target</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-yellow-500" />
              <span className="text-xs text-gray-500">Quality</span>
            </div>
            <p className="text-3xl font-bold text-white">A+</p>
            <p className="text-sm text-gray-400">Average Grade</p>
            <p className="text-sm text-yellow-400 mt-1">92% premium grade</p>
          </div>
        </div>
      )}
    </div>
  );
}