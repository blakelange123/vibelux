'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Zap,
  Calendar,
  Users,
  Target,
  Info,
  ArrowRight,
  Filter,
  Search,
  ChevronLeft
} from 'lucide-react';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card';

interface InvestmentOpportunity {
  id: string;
  facilityName: string;
  location: string;
  facilityType: 'INDOOR_FARM' | 'GREENHOUSE' | 'VERTICAL_FARM';
  investmentType: 'GAAS' | 'YEP' | 'HYBRID';
  minimumInvestment: number;
  targetRaise: number;
  currentRaised: number;
  targetIRR: number;
  paybackPeriod: number;
  status: 'OPEN' | 'CLOSING_SOON' | 'FUNDED';
  highlights: string[];
  metrics: {
    squareFeet: number;
    estimatedYield: number;
    energyEfficiency: number;
    automationLevel: number;
  };
  riskScore: number;
  closingDate: string;
  description: string;
}

const mockOpportunities: InvestmentOpportunity[] = [
  {
    id: 'opp-1',
    facilityName: 'AeroGreen Technologies',
    location: 'Columbus, OH',
    facilityType: 'VERTICAL_FARM',
    investmentType: 'GAAS',
    minimumInvestment: 50000,
    targetRaise: 2500000,
    currentRaised: 1750000,
    targetIRR: 22,
    paybackPeriod: 4.5,
    status: 'CLOSING_SOON',
    highlights: [
      'Proprietary aeroponic system',
      'Partnership with major retailer',
      'USDA Organic certified',
      'AI-driven climate control'
    ],
    metrics: {
      squareFeet: 45000,
      estimatedYield: 850000, // lbs per year
      energyEfficiency: 92,
      automationLevel: 85
    },
    riskScore: 35,
    closingDate: '2024-07-15',
    description: 'State-of-the-art vertical farming facility specializing in leafy greens with confirmed off-take agreements.'
  },
  {
    id: 'opp-2',
    facilityName: 'SunHarvest Greenhouses',
    location: 'Phoenix, AZ',
    facilityType: 'GREENHOUSE',
    investmentType: 'YEP',
    minimumInvestment: 25000,
    targetRaise: 1500000,
    currentRaised: 450000,
    targetIRR: 18,
    paybackPeriod: 5.2,
    status: 'OPEN',
    highlights: [
      'Solar-powered operations',
      'Water recycling system',
      'Premium tomato varieties',
      'Local distribution network'
    ],
    metrics: {
      squareFeet: 60000,
      estimatedYield: 1200000,
      energyEfficiency: 88,
      automationLevel: 70
    },
    riskScore: 45,
    closingDate: '2024-08-30',
    description: 'High-tech greenhouse facility leveraging Arizona\'s abundant sunlight for year-round premium produce.'
  },
  {
    id: 'opp-3',
    facilityName: 'Urban Roots Detroit',
    location: 'Detroit, MI',
    facilityType: 'INDOOR_FARM',
    investmentType: 'HYBRID',
    minimumInvestment: 75000,
    targetRaise: 3000000,
    currentRaised: 2850000,
    targetIRR: 25,
    paybackPeriod: 4.0,
    status: 'CLOSING_SOON',
    highlights: [
      'Downtown location near customers',
      'Multi-tier growing system',
      'B2B restaurant contracts',
      'Expansion opportunity'
    ],
    metrics: {
      squareFeet: 35000,
      estimatedYield: 650000,
      energyEfficiency: 90,
      automationLevel: 88
    },
    riskScore: 38,
    closingDate: '2024-07-01',
    description: 'Urban farming facility serving Detroit\'s growing farm-to-table restaurant scene with ultra-fresh produce.'
  },
  {
    id: 'opp-4',
    facilityName: 'Pacific Coast Farms',
    location: 'Portland, OR',
    facilityType: 'GREENHOUSE',
    investmentType: 'GAAS',
    minimumInvestment: 100000,
    targetRaise: 4000000,
    currentRaised: 1200000,
    targetIRR: 20,
    paybackPeriod: 4.8,
    status: 'OPEN',
    highlights: [
      'Organic certification pending',
      'Renewable energy powered',
      'Specialty herbs and microgreens',
      'Tech-enabled operations'
    ],
    metrics: {
      squareFeet: 80000,
      estimatedYield: 400000,
      energyEfficiency: 94,
      automationLevel: 82
    },
    riskScore: 42,
    closingDate: '2024-09-15',
    description: 'Next-generation greenhouse complex focused on high-value specialty crops for the Pacific Northwest market.'
  }
];

export default function InvestmentOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>(mockOpportunities);
  const [filteredOpportunities, setFilteredOpportunities] = useState<InvestmentOpportunity[]>(mockOpportunities);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('irr');

  useEffect(() => {
    // Filter and sort opportunities
    let filtered = [...opportunities];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(opp => 
        opp.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(opp => opp.investmentType === typeFilter);
    }

    // Apply status filter  
    if (statusFilter !== 'all') {
      filtered = filtered.filter(opp => opp.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'irr':
          return b.targetIRR - a.targetIRR;
        case 'minimum':
          return a.minimumInvestment - b.minimumInvestment;
        case 'closing':
          return new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime();
        case 'progress':
          return (b.currentRaised / b.targetRaise) - (a.currentRaised / a.targetRaise);
        default:
          return 0;
      }
    });

    setFilteredOpportunities(filtered);
  }, [opportunities, searchTerm, typeFilter, statusFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-500';
      case 'CLOSING_SOON':
        return 'bg-yellow-500';
      case 'FUNDED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 40) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/investment">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Investment Opportunities</h1>
            <p className="text-muted-foreground">Discover and invest in high-growth indoor farming facilities</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Investment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="GAAS">GaaS</SelectItem>
                <SelectItem value="YEP">YEP</SelectItem>
                <SelectItem value="HYBRID">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="CLOSING_SOON">Closing Soon</SelectItem>
                <SelectItem value="FUNDED">Funded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="irr">Highest IRR</SelectItem>
                <SelectItem value="minimum">Lowest Minimum</SelectItem>
                <SelectItem value="closing">Closing Date</SelectItem>
                <SelectItem value="progress">Funding Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredOpportunities.length} of {opportunities.length} opportunities
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOpportunities.map((opportunity) => {
          const progressPercentage = (opportunity.currentRaised / opportunity.targetRaise) * 100;
          
          return (
            <AnimatedCard key={opportunity.id} hover className="h-full">
              <AnimatedCardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <AnimatedCardTitle className="text-xl">
                      {opportunity.facilityName}
                    </AnimatedCardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {opportunity.location}
                    </div>
                  </div>
                  <Badge className={getStatusColor(opportunity.status)}>
                    {opportunity.status.replace('_', ' ')}
                  </Badge>
                </div>
              </AnimatedCardHeader>
              
              <AnimatedCardContent>
                <div className="space-y-4">
                  {/* Investment Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Investment Type</p>
                      <p className="font-semibold">{opportunity.investmentType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Target IRR</p>
                      <p className="font-semibold text-green-600">{opportunity.targetIRR}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Minimum Investment</p>
                      <p className="font-semibold">${opportunity.minimumInvestment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payback Period</p>
                      <p className="font-semibold">{opportunity.paybackPeriod} years</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-semibold">{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>${opportunity.currentRaised.toLocaleString()} raised</span>
                      <span>${opportunity.targetRaise.toLocaleString()} target</span>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <p className="text-xs text-muted-foreground">Sq Ft</p>
                      <p className="text-sm font-semibold">{(opportunity.metrics.squareFeet / 1000).toFixed(0)}k</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <p className="text-xs text-muted-foreground">Yield</p>
                      <p className="text-sm font-semibold">{(opportunity.metrics.estimatedYield / 1000).toFixed(0)}k</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <p className="text-xs text-muted-foreground">Efficiency</p>
                      <p className="text-sm font-semibold">{opportunity.metrics.energyEfficiency}%</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <p className="text-xs text-muted-foreground">Risk</p>
                      <p className={`text-sm font-semibold ${getRiskColor(opportunity.riskScore)}`}>
                        {opportunity.riskScore}
                      </p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Key Highlights</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {opportunity.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {opportunity.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/investment/opportunities/${opportunity.id}`} className="flex-1">
                      <Button className="w-full">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Button variant="outline">
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Closing Date */}
                  {opportunity.status !== 'FUNDED' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Closing: {new Date(opportunity.closingDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </AnimatedCardContent>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredOpportunities.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No opportunities match your criteria</p>
          <Button onClick={() => {
            setSearchTerm('');
            setTypeFilter('all');
            setStatusFilter('all');
          }}>
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
}