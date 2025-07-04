'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles,
  Building2,
  Target,
  TrendingUp,
  MapPin,
  DollarSign,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Heart,
  Info,
  ChevronLeft
} from 'lucide-react';

interface MatchedOpportunity {
  id: string;
  matchScore: number;
  matchReasons: string[];
  facility: {
    id: string;
    name: string;
    location: string;
    type: string;
    size: number;
    established: string;
    description: string;
  };
  investment: {
    type: 'GAAS' | 'YEP' | 'HYBRID';
    minimumInvestment: number;
    targetRaise: number;
    currentRaised: number;
    targetIRR: number;
    paybackPeriod: number;
    monthlyRevenue?: number;
    revenueShare?: number;
  };
  metrics: {
    currentYield: number;
    projectedYield: number;
    energyEfficiency: number;
    automationLevel: number;
    qualityScore: number;
  };
  riskFactors: {
    score: number;
    factors: string[];
    mitigations: string[];
  };
  grower: {
    name: string;
    experience: string;
    previousRounds: number;
    successRate: number;
  };
  status: 'OPEN' | 'DUE_DILIGENCE' | 'CLOSING_SOON';
  nextSteps: string[];
}

// Mock matched opportunities based on investor profile
const mockMatches: MatchedOpportunity[] = [
  {
    id: 'match-1',
    matchScore: 95,
    matchReasons: [
      'Aligns with your 22% target IRR',
      'Located in preferred Midwest region',
      'Proven operator with 3 successful exits',
      'Energy efficiency focus matches your interests'
    ],
    facility: {
      id: 'fac-1',
      name: 'GreenPeak Cultivation',
      location: 'Columbus, OH',
      type: 'Indoor Farm',
      size: 45000,
      established: '2021',
      description: 'State-of-the-art indoor cultivation facility with advanced automation and energy management systems.'
    },
    investment: {
      type: 'HYBRID',
      minimumInvestment: 75000,
      targetRaise: 2500000,
      currentRaised: 1250000,
      targetIRR: 24,
      paybackPeriod: 4.2,
      monthlyRevenue: 15000,
      revenueShare: 15
    },
    metrics: {
      currentYield: 55,
      projectedYield: 72,
      energyEfficiency: 88,
      automationLevel: 85,
      qualityScore: 94
    },
    riskFactors: {
      score: 35,
      factors: ['Market competition', 'Regulatory changes'],
      mitigations: ['Long-term contracts', 'Multi-state licenses']
    },
    grower: {
      name: 'Sarah Chen',
      experience: '12 years',
      previousRounds: 3,
      successRate: 92
    },
    status: 'OPEN',
    nextSteps: ['Schedule intro call', 'Review financial projections', 'Site visit available']
  },
  {
    id: 'match-2',
    matchScore: 88,
    matchReasons: [
      'Conservative risk profile match',
      'Established facility with proven track record',
      'Monthly service fee model provides predictable returns',
      'Below your maximum investment threshold'
    ],
    facility: {
      id: 'fac-2',
      name: 'Sunrise Gardens LLC',
      location: 'Detroit, MI',
      type: 'Greenhouse',
      size: 60000,
      established: '2019',
      description: 'Hybrid greenhouse operation specializing in premium flower with established retail partnerships.'
    },
    investment: {
      type: 'GAAS',
      minimumInvestment: 50000,
      targetRaise: 1500000,
      currentRaised: 900000,
      targetIRR: 18,
      paybackPeriod: 5.0,
      monthlyRevenue: 8500
    },
    metrics: {
      currentYield: 48,
      projectedYield: 58,
      energyEfficiency: 82,
      automationLevel: 70,
      qualityScore: 91
    },
    riskFactors: {
      score: 28,
      factors: ['Equipment age', 'Labor dependency'],
      mitigations: ['Maintenance contracts', 'Training programs']
    },
    grower: {
      name: 'Marcus Johnson',
      experience: '8 years',
      previousRounds: 2,
      successRate: 88
    },
    status: 'DUE_DILIGENCE',
    nextSteps: ['Financial documents available', 'Q&A session Thursday', 'Investment committee review']
  },
  {
    id: 'match-3',
    matchScore: 82,
    matchReasons: [
      'High growth potential aligns with aggressive options',
      'YEP model offers performance-based upside',
      'Strong management team',
      'Expansion into your preferred Southwest region'
    ],
    facility: {
      id: 'fac-3',
      name: 'Desert Bloom Farms',
      location: 'Phoenix, AZ',
      type: 'Vertical Farm',
      size: 35000,
      established: '2023',
      description: 'Next-generation vertical farming facility using proprietary LED spectrum optimization technology.'
    },
    investment: {
      type: 'YEP',
      minimumInvestment: 100000,
      targetRaise: 3000000,
      currentRaised: 450000,
      targetIRR: 28,
      paybackPeriod: 3.8,
      revenueShare: 20
    },
    metrics: {
      currentYield: 42,
      projectedYield: 68,
      energyEfficiency: 92,
      automationLevel: 90,
      qualityScore: 89
    },
    riskFactors: {
      score: 48,
      factors: ['New facility', 'Technology risk', 'Market entry'],
      mitigations: ['Experienced team', 'Patent pending tech', 'LOIs secured']
    },
    grower: {
      name: 'Dr. James Park',
      experience: '15 years',
      previousRounds: 4,
      successRate: 85
    },
    status: 'CLOSING_SOON',
    nextSteps: ['Closing in 2 weeks', 'Final documentation ready', 'Investor webinar Tuesday']
  }
];

export default function InvestmentMatches() {
  const [matches, setMatches] = useState<MatchedOpportunity[]>(mockMatches);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [favoriteMatches, setFavoriteMatches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const toggleFavorite = (matchId: string) => {
    setFavoriteMatches(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    );
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-900/20 border-green-600';
    if (score >= 75) return 'text-blue-400 bg-blue-900/20 border-blue-600';
    return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
  };

  const getRiskScoreColor = (score: number) => {
    if (score < 30) return 'text-green-400';
    if (score < 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredMatches = activeTab === 'favorites' 
    ? matches.filter(m => favoriteMatches.includes(m.id))
    : matches;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/investment/onboarding">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Preferences
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              Your Matched Opportunities
            </h1>
            <p className="text-gray-400 mt-2">
              AI-powered matches based on your investment profile and preferences
            </p>
          </div>
          <Link href="/investment/opportunities">
            <Button variant="outline">
              Browse All Opportunities
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Match Summary */}
      <Card className="mb-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-600">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-400">Total Matches</p>
              <p className="text-2xl font-bold text-white">{matches.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg Match Score</p>
              <p className="text-2xl font-bold text-purple-400">
                {Math.round(matches.reduce((acc, m) => acc + m.matchScore, 0) / matches.length)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Investment Range</p>
              <p className="text-2xl font-bold text-white">$50K - $3M</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg Target IRR</p>
              <p className="text-2xl font-bold text-green-400">
                {Math.round(matches.reduce((acc, m) => acc + m.investment.targetIRR, 0) / matches.length)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Matches ({matches.length})</TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="w-4 h-4 mr-1" />
            Favorites ({favoriteMatches.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMatches.map((match) => (
          <Card key={match.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    {match.facility.name}
                    {match.status === 'CLOSING_SOON' && (
                      <Badge className="bg-red-900/50 text-red-300 border-red-600">
                        Closing Soon
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {match.facility.location} • {match.facility.type}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(match.id)}
                    className={favoriteMatches.includes(match.id) ? 'text-red-400' : 'text-gray-400'}
                  >
                    <Heart className={`w-5 h-5 ${favoriteMatches.includes(match.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Badge className={getMatchScoreColor(match.matchScore)}>
                    {match.matchScore}% Match
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Match Reasons */}
              <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3">
                <p className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Why this matches your profile:
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  {match.matchReasons.slice(0, 3).map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Investment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Investment Type</p>
                  <p className="font-semibold text-white">{match.investment.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Target IRR</p>
                  <p className="font-semibold text-green-400">{match.investment.targetIRR}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Minimum</p>
                  <p className="font-semibold text-white">${match.investment.minimumInvestment.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Payback</p>
                  <p className="font-semibold text-white">{match.investment.paybackPeriod} years</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Funding Progress</span>
                  <span className="text-white">
                    {Math.round((match.investment.currentRaised / match.investment.targetRaise) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(match.investment.currentRaised / match.investment.targetRaise) * 100} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>${match.investment.currentRaised.toLocaleString()}</span>
                  <span>${match.investment.targetRaise.toLocaleString()}</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-700/50 rounded p-2 text-center">
                  <p className="text-xs text-gray-400">Yield ↑</p>
                  <p className="text-sm font-semibold text-green-400">
                    +{Math.round(((match.metrics.projectedYield - match.metrics.currentYield) / match.metrics.currentYield) * 100)}%
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded p-2 text-center">
                  <p className="text-xs text-gray-400">Risk</p>
                  <p className={`text-sm font-semibold ${getRiskScoreColor(match.riskFactors.score)}`}>
                    {match.riskFactors.score}
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded p-2 text-center">
                  <p className="text-xs text-gray-400">Quality</p>
                  <p className="text-sm font-semibold text-white">{match.metrics.qualityScore}%</p>
                </div>
              </div>

              {/* Grower Info */}
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">{match.grower.name}</p>
                  <p className="text-xs text-gray-400">
                    {match.grower.experience} • {match.grower.successRate}% success rate
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {match.grower.previousRounds} rounds
                </Badge>
              </div>

              {/* Next Steps */}
              <div className="border-t border-gray-700 pt-4">
                <p className="text-sm font-medium text-white mb-2">Next Steps:</p>
                <div className="flex flex-wrap gap-2">
                  {match.nextSteps.map((step, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {step}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/investment/opportunities/${match.facility.id}`} className="flex-1">
                  <Button className="w-full">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" size="icon">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMatches.length === 0 && (
        <Card className="p-12 text-center bg-gray-800 border-gray-700">
          <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No favorites yet</p>
          <p className="text-sm text-gray-500">Click the heart icon on matches you're interested in</p>
        </Card>
      )}

      {/* Help Card */}
      <Card className="mt-8 bg-blue-900/20 border-blue-600/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">Understanding Your Matches</h3>
              <p className="text-sm text-gray-300 mb-3">
                Our AI analyzes dozens of factors including your investment criteria, risk tolerance, 
                geographic preferences, and past investment patterns to find the best matches for you.
              </p>
              <div className="flex gap-4">
                <Button size="sm" variant="outline">
                  Refine Preferences
                </Button>
                <Button size="sm" variant="outline">
                  Get Help
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}