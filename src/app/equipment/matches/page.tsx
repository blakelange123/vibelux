'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Filter, TrendingUp, AlertCircle,
  Zap, DollarSign, MapPin, CheckCircle, Clock, 
  ThumbsUp, ThumbsDown, MessageSquare, Sparkles,
  Package, Settings, RefreshCw, Download, Share2,
  Star, ArrowUpRight, ArrowDownRight, Building2
} from 'lucide-react';

interface EquipmentMatch {
  id: string;
  equipment: {
    id: string;
    title: string;
    brand: string;
    model: string;
    category: string;
    price: number;
    condition: string;
    location: {
      city: string;
      state: string;
      distance: number;
    };
    seller: {
      name: string;
      verified: boolean;
      rating: number;
    };
    images: string[];
  };
  matchScore: number;
  matchReasons: {
    type: 'energy_savings' | 'roi' | 'compatibility' | 'price' | 'location';
    description: string;
    impact: number;
  }[];
  analysis: {
    energySavings: {
      monthly: number;
      annual: number;
      percentage: number;
    };
    roi: {
      months: number;
      totalSavings: number;
      netBenefit: number;
    };
    compatibility: {
      score: number;
      factors: string[];
      warnings?: string[];
    };
  };
  recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'not_recommended';
  alternativeOptions: number;
  userAction?: 'liked' | 'disliked' | 'contacted' | 'purchased';
}

interface MatchFilters {
  minScore: number;
  maxPrice: number;
  maxDistance: number;
  categories: string[];
  energyEfficiencyMin: number;
  roiMonthsMax: number;
}

export default function EquipmentMatchesPage() {
  const [matches, setMatches] = useState<EquipmentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'match_score' | 'roi' | 'price' | 'distance'>('match_score');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filters, setFilters] = useState<MatchFilters>({
    minScore: 70,
    maxPrice: 50000,
    maxDistance: 500,
    categories: [],
    energyEfficiencyMin: 2.5,
    roiMonthsMax: 24
  });

  useEffect(() => {
    loadMatches();
  }, [sortBy, filters]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockMatches = generateMockMatches();
      setMatches(mockMatches);
    } finally {
      setLoading(false);
    }
  };

  const generateMockMatches = (): EquipmentMatch[] => {
    return [
      {
        id: '1',
        equipment: {
          id: 'eq1',
          title: 'Fluence RAZR Modular LED System',
          brand: 'Fluence',
          model: 'RAZR Modular',
          category: 'lighting',
          price: 12500,
          condition: 'new',
          location: { city: 'Denver', state: 'CO', distance: 0 },
          seller: { name: 'LED Direct Supply', verified: true, rating: 4.9 },
          images: ['/api/placeholder/400/300']
        },
        matchScore: 94,
        matchReasons: [
          { type: 'energy_savings', description: '32% reduction in energy costs', impact: 35 },
          { type: 'roi', description: 'Payback in 14 months', impact: 30 },
          { type: 'compatibility', description: 'Perfect fit for your 4000 sq ft flower room', impact: 25 },
          { type: 'price', description: '18% below market average', impact: 10 }
        ],
        analysis: {
          energySavings: { monthly: 1850, annual: 22200, percentage: 32 },
          roi: { months: 14, totalSavings: 88800, netBenefit: 76300 },
          compatibility: { 
            score: 98, 
            factors: ['Exact coverage match', 'Compatible with existing controls', 'Optimal spectrum for cannabis'],
            warnings: []
          }
        },
        recommendation: 'highly_recommended',
        alternativeOptions: 3
      },
      {
        id: '2',
        equipment: {
          id: 'eq2',
          title: 'Quest CDG 174 Dehumidifier Package (3 Units)',
          brand: 'Quest',
          model: 'CDG 174',
          category: 'hvac',
          price: 8700,
          condition: 'like_new',
          location: { city: 'Portland', state: 'OR', distance: 120 },
          seller: { name: 'Pacific Climate Solutions', verified: true, rating: 4.7 },
          images: ['/api/placeholder/400/300']
        },
        matchScore: 88,
        matchReasons: [
          { type: 'energy_savings', description: '28% more efficient than current units', impact: 30 },
          { type: 'compatibility', description: 'Matches your humidity control needs', impact: 30 },
          { type: 'roi', description: '18-month payback period', impact: 25 },
          { type: 'location', description: 'Available locally with installation', impact: 15 }
        ],
        analysis: {
          energySavings: { monthly: 420, annual: 5040, percentage: 28 },
          roi: { months: 18, totalSavings: 20160, netBenefit: 11460 },
          compatibility: { 
            score: 92, 
            factors: ['Capacity matches room size', 'Integrates with Argus controls'],
            warnings: ['May need additional unit for peak summer']
          }
        },
        recommendation: 'recommended',
        alternativeOptions: 5
      },
      {
        id: '3',
        equipment: {
          id: 'eq3',
          title: 'Priva Connext Climate Computer',
          brand: 'Priva',
          model: 'Connext',
          category: 'controls',
          price: 22000,
          condition: 'new',
          location: { city: 'Sacramento', state: 'CA', distance: 85 },
          seller: { name: 'AgTech Systems', verified: true, rating: 5.0 },
          images: ['/api/placeholder/400/300']
        },
        matchScore: 82,
        matchReasons: [
          { type: 'compatibility', description: 'Advanced integration capabilities', impact: 35 },
          { type: 'energy_savings', description: 'Optimizes all systems for 22% savings', impact: 30 },
          { type: 'roi', description: '24-month ROI with rebates', impact: 20 },
          { type: 'price', description: 'Includes $3000 utility rebate', impact: 15 }
        ],
        analysis: {
          energySavings: { monthly: 1100, annual: 13200, percentage: 22 },
          roi: { months: 24, totalSavings: 52800, netBenefit: 30800 },
          compatibility: { 
            score: 88, 
            factors: ['Full VibeLux integration', 'AI optimization features', 'Remote monitoring'],
            warnings: ['Requires professional installation', 'Staff training needed']
          }
        },
        recommendation: 'recommended',
        alternativeOptions: 2
      }
    ];
  };

  const filteredMatches = matches
    .filter(match => {
      const matchesSearch = searchTerm === '' || 
        match.equipment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.equipment.brand.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesScore = match.matchScore >= filters.minScore;
      const matchesPrice = match.equipment.price <= filters.maxPrice;
      const matchesDistance = match.equipment.location.distance <= filters.maxDistance;
      const matchesROI = match.analysis.roi.months <= filters.roiMonthsMax;
      
      return matchesSearch && matchesScore && matchesPrice && matchesDistance && matchesROI;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'match_score':
          return b.matchScore - a.matchScore;
        case 'roi':
          return a.analysis.roi.months - b.analysis.roi.months;
        case 'price':
          return a.equipment.price - b.equipment.price;
        case 'distance':
          return a.equipment.location.distance - b.equipment.location.distance;
        default:
          return 0;
      }
    });

  const handleRefreshMatches = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await loadMatches();
    setRefreshing(false);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended': return 'text-green-400 bg-green-500/20';
      case 'recommended': return 'text-blue-400 bg-blue-500/20';
      case 'consider': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Equipment
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Smart Equipment Matches</h1>
              <p className="text-gray-400">
                AI-powered recommendations based on your facility and optimization goals
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshMatches}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Match Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Matches</p>
                <p className="text-2xl font-bold text-white">{matches.length}</p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg. Energy Savings</p>
                <p className="text-2xl font-bold text-white">27%</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg. ROI Period</p>
                <p className="text-2xl font-bold text-white">18.7mo</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Potential Savings</p>
                <p className="text-2xl font-bold text-white">$161K</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="match_score">Best Match</option>
            <option value="roi">Fastest ROI</option>
            <option value="price">Lowest Price</option>
            <option value="distance">Nearest Location</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Filter Matches</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Minimum Match Score: {filters.minScore}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={filters.minScore}
                  onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Max Price: ${filters.maxPrice.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Max ROI Period: {filters.roiMonthsMax} months
                </label>
                <input
                  type="range"
                  min="6"
                  max="60"
                  value={filters.roiMonthsMax}
                  onChange={(e) => setFilters({ ...filters, roiMonthsMax: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-purple-500 animate-pulse mx-auto mb-4" />
                <p className="text-gray-400">Finding your perfect equipment matches...</p>
              </div>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No matches found with current filters</p>
                <button
                  onClick={() => setFilters({
                    minScore: 70,
                    maxPrice: 50000,
                    maxDistance: 500,
                    categories: [],
                    energyEfficiencyMin: 2.5,
                    roiMonthsMax: 24
                  })}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Reset filters
                </button>
              </div>
            </div>
          ) : (
            filteredMatches.map((match) => (
              <div
                key={match.id}
                className={`bg-gray-900/50 rounded-xl border transition-all ${
                  selectedMatch === match.id
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'border-white/10 hover:border-purple-500/50'
                }`}
                onClick={() => setSelectedMatch(match.id)}
              >
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Equipment Image */}
                    <div className="w-32 h-32 bg-gray-800 rounded-lg flex-shrink-0">
                      <img
                        src={match.equipment.images[0]}
                        alt={match.equipment.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-semibold text-white">{match.equipment.title}</h3>
                            <span className={`text-sm px-3 py-1 rounded-full ${getRecommendationColor(match.recommendation)}`}>
                              {match.recommendation.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-gray-400">{match.equipment.brand} {match.equipment.model}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${getMatchScoreColor(match.matchScore)}`}>
                            {match.matchScore}%
                          </div>
                          <p className="text-sm text-gray-400">match score</p>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {match.matchReasons.map((reason, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              {reason.type === 'energy_savings' && <Zap className="w-4 h-4 text-yellow-400" />}
                              {reason.type === 'roi' && <TrendingUp className="w-4 h-4 text-green-400" />}
                              {reason.type === 'compatibility' && <CheckCircle className="w-4 h-4 text-blue-400" />}
                              {reason.type === 'price' && <DollarSign className="w-4 h-4 text-purple-400" />}
                              {reason.type === 'location' && <MapPin className="w-4 h-4 text-orange-400" />}
                              <span className="text-xs text-gray-400">{reason.impact}%</span>
                            </div>
                            <p className="text-xs text-gray-300">{reason.description}</p>
                          </div>
                        ))}
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Energy Savings</p>
                          <p className="text-lg font-semibold text-white">
                            ${match.analysis.energySavings.monthly.toLocaleString()}/mo
                          </p>
                          <p className="text-sm text-green-400 flex items-center gap-1">
                            <ArrowDownRight className="w-3 h-3" />
                            {match.analysis.energySavings.percentage}% reduction
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">ROI Period</p>
                          <p className="text-lg font-semibold text-white">
                            {match.analysis.roi.months} months
                          </p>
                          <p className="text-sm text-gray-300">
                            Net: ${match.analysis.roi.netBenefit.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Investment</p>
                          <p className="text-lg font-semibold text-white">
                            ${match.equipment.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {match.equipment.location.distance} mi away
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedMatch === match.id && (
                    <div className="mt-6 pt-6 border-t border-gray-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Compatibility Analysis */}
                        <div>
                          <h4 className="text-sm font-medium text-white mb-3">Compatibility Analysis</h4>
                          <div className="space-y-2">
                            {match.analysis.compatibility.factors.map((factor, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                                <p className="text-sm text-gray-300">{factor}</p>
                              </div>
                            ))}
                            {match.analysis.compatibility.warnings?.map((warning, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                                <p className="text-sm text-yellow-300">{warning}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Seller Info */}
                        <div>
                          <h4 className="text-sm font-medium text-white mb-3">Seller Information</h4>
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-white font-medium flex items-center gap-2">
                                    {match.equipment.seller.name}
                                    {match.equipment.seller.verified && (
                                      <CheckCircle className="w-4 h-4 text-blue-400" />
                                    )}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Star className="w-3 h-3 text-yellow-400" />
                                    {match.equipment.seller.rating}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                Contact Seller
                              </button>
                              <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Alternative Options */}
                      {match.alternativeOptions > 0 && (
                        <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                          <p className="text-sm text-blue-300">
                            <span className="font-medium">Also consider:</span> {match.alternativeOptions} similar options available with comparable benefits
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4 mt-6">
                        <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4" />
                          Interested
                        </button>
                        <button className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Ask Questions
                        </button>
                        <button className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                          <ThumbsDown className="w-4 h-4" />
                          Not Interested
                        </button>
                        <Link
                          href={`/equipment/offers/${match.equipment.id}`}
                          className="ml-auto text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          View Full Details
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Insights */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Matching Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Top Opportunities:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• LED upgrades show fastest ROI with 32% energy reduction</li>
                    <li>• HVAC optimization could save $5,040 annually</li>
                    <li>• Control system integration enables 22% total facility savings</li>
                    <li>• All top matches available within 120 miles</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Recommendations:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Prioritize lighting upgrade for immediate impact</li>
                    <li>• Consider bundling HVAC with controls for better pricing</li>
                    <li>• Check for utility rebates on efficiency equipment</li>
                    <li>• Request on-site demos for control systems</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}