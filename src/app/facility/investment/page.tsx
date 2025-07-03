'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  DollarSign,
  Users,
  TrendingUp,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  Send,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

// Investment opportunity types
const investmentTypes = {
  GAAS: {
    name: 'Growing as a Service',
    description: 'Equipment financing with monthly service fees',
    color: 'bg-blue-100 text-blue-700',
  },
  YEP: {
    name: 'Yield Enhancement Program',
    description: 'Revenue sharing based on yield improvements',
    color: 'bg-green-100 text-green-700',
  },
  HYBRID: {
    name: 'Hybrid Model',
    description: 'Combination of GaaS and YEP',
    color: 'bg-purple-100 text-purple-700',
  },
};

// Mock data
const opportunities = [
  {
    id: 'opp-1',
    title: 'LED Lighting Upgrade - Phase 2',
    type: 'GAAS',
    status: 'active',
    created: '2024-03-15',
    targetAmount: 1000000,
    raisedAmount: 750000,
    investors: 12,
    documents: 8,
    lastUpdate: '2 days ago',
    closingDate: '2024-07-15',
  },
  {
    id: 'opp-2',
    title: 'Vertical Farming Expansion',
    type: 'YEP',
    status: 'draft',
    created: '2024-05-01',
    targetAmount: 500000,
    raisedAmount: 250000,
    investors: 5,
    documents: 5,
    lastUpdate: '1 week ago',
    closingDate: '2024-08-30',
  },
  {
    id: 'opp-3',
    title: 'Automation System Implementation',
    type: 'HYBRID',
    status: 'review',
    created: '2024-04-20',
    targetAmount: 750000,
    raisedAmount: 0,
    investors: 0,
    documents: 10,
    lastUpdate: '3 days ago',
    closingDate: null,
  },
];

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Edit },
  review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

export default function FacilityInvestmentDashboard() {
  const [selectedTab, setSelectedTab] = useState('all');

  const stats = {
    totalRaised: 1250000,
    activeOpportunities: 2,
    totalInvestors: 17,
    avgFundingTime: 45, // days
  };

  const filteredOpportunities = selectedTab === 'all' 
    ? opportunities 
    : opportunities.filter(opp => opp.status === selectedTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Investment Hub</h1>
          <p className="text-gray-600 mt-1">Create and manage funding opportunities</p>
        </div>
        <Link href="/facility/investment/create">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Create New Opportunity
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Raised</p>
                <p className="text-2xl font-bold">${(stats.totalRaised / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Opportunities</p>
                <p className="text-2xl font-bold">{stats.activeOpportunities}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Investors</p>
                <p className="text-2xl font-bold">{stats.totalInvestors}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Funding Time</p>
                <p className="text-2xl font-bold">{stats.avgFundingTime} days</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities List */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Opportunities</CardTitle>
          <CardDescription>Manage your active and draft funding campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="review">Under Review</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              <div className="space-y-4">
                {filteredOpportunities.map((opp) => {
                  const StatusIcon = statusConfig[opp.status].icon;
                  const typeInfo = investmentTypes[opp.type];
                  
                  return (
                    <div key={opp.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{opp.title}</h3>
                            <Badge className={statusConfig[opp.status].color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[opp.status].label}
                            </Badge>
                            <Badge className={typeInfo.color}>
                              {opp.type}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{typeInfo.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Target Amount</p>
                              <p className="font-medium">${(opp.targetAmount / 1000000).toFixed(1)}M</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Raised</p>
                              <p className="font-medium">
                                ${(opp.raisedAmount / 1000).toFixed(0)}k 
                                <span className="text-xs text-gray-500 ml-1">
                                  ({Math.round((opp.raisedAmount / opp.targetAmount) * 100)}%)
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Investors</p>
                              <p className="font-medium">{opp.investors}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Documents</p>
                              <p className="font-medium">{opp.documents}</p>
                            </div>
                          </div>
                          
                          {opp.status === 'active' && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${(opp.raisedAmount / opp.targetAmount) * 100}%` }}
                              />
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>Created {new Date(opp.created).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Updated {opp.lastUpdate}</span>
                            {opp.closingDate && (
                              <>
                                <span>•</span>
                                <span>Closes {new Date(opp.closingDate).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          {opp.status === 'draft' && (
                            <Link href={`/facility/investment/${opp.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {opp.status === 'review' && (
                            <Button variant="outline" size="sm" disabled>
                              <Clock className="h-4 w-4" />
                            </Button>
                          )}
                          {opp.status === 'active' && (
                            <>
                              <Link href={`/facility/investment/${opp.id}/analytics`}>
                                <Button variant="outline" size="sm">
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/facility/investment/${opp.id}/investors`}>
                                <Button variant="outline" size="sm">
                                  <Users className="h-4 w-4" />
                                </Button>
                              </Link>
                            </>
                          )}
                          <Link href={`/facility/investment/${opp.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Tips for Success</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Keep your financial documents up to date to build investor confidence</li>
                <li>• Respond to investor questions within 24 hours</li>
                <li>• Submit monthly performance reports to maintain transparency</li>
                <li>• Consider offering both GaaS and YEP options to attract different investor types</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}