'use client';

import { useState, useEffect } from 'react';
import { InvestmentDataGenerator } from '@/lib/investment-data-generator';
import { 
  Facility, 
  Investment, 
  InvestmentProposal,
  InvestmentType,
  DealStatus
} from '@/types/investment';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Building2,
  TrendingUp,
  Zap,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ArrowRight,
  Calculator,
  BarChart3
} from 'lucide-react';

interface DealFlowProposal extends InvestmentProposal {
  facility?: Facility;
  projectedMetrics?: {
    monthlyRevenue: number;
    totalReturn: number;
    energySavings: number;
    co2Reduction: number;
  };
}

export default function DealFlowPage() {
  const [proposals, setProposals] = useState<DealFlowProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<DealFlowProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pipeline');

  useEffect(() => {
    // Generate faux data
    const data = InvestmentDataGenerator.generateFullDataset(5, 20, 15);
    
    // Create investment proposals from facilities
    const proposalData: DealFlowProposal[] = data.facilities.slice(0, 10).map((facility, index) => {
      const proposalType = ['gaas', 'yep', 'hybrid'][index % 3] as InvestmentType;
      
      // Calculate projections based on facility type and current performance
      let projectedYieldImprovement: number;
      let projectedEnergySavings: number;
      
      if (facility.currentLightingType === 'HPS') {
        projectedYieldImprovement = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2 + 0.2; // 20-40%
        projectedEnergySavings = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2 + 0.35; // 35-55%
      } else {
        projectedYieldImprovement = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1 + 0.1; // 10-20%
        projectedEnergySavings = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.15 + 0.15; // 15-30%
      }
      
      const proposedInvestment = proposalType === 'yep' ? 0 : facility.activeGrowSqft * (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 + 5);
      const monthlyRevenue = proposalType === 'yep' 
        ? facility.annualRevenue * projectedYieldImprovement * 0.7 / 12 // 70% revenue share
        : proposedInvestment * 0.03; // 3% monthly service fee
      
      const proposal: DealFlowProposal = {
        id: `prop-${Date.now()}-${index}`,
        facilityId: facility.id,
        proposalType,
        proposedInvestment,
        proposedTerms: {
          contractLength: proposalType === 'yep' ? 60 : 48, // months
          revenueShare: proposalType === 'yep' ? 70 : 0,
          monthlyServiceFee: proposalType === 'gaas' ? proposedInvestment * 0.03 : 0
        },
        projectedYieldImprovement: projectedYieldImprovement * 100,
        projectedEnergySavings: projectedEnergySavings * 100,
        projectedIRR: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.25 + 0.15, // 15-40%
        projectedPaybackMonths: proposalType === 'yep' ? 0 : Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 24 + 12),
        riskAssessment: generateRiskAssessment(facility),
        opportunityScore: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30 + 70, // 70-100
        aiRecommendation: generateAIRecommendation(facility, projectedYieldImprovement),
        status: ['draft', 'submitted', 'under_review', 'under_review', 'approved'][index % 5] as any,
        submittedDate: index % 5 > 0 ? new Date(Date.now() - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30 * 24 * 60 * 60 * 1000) : undefined,
        createdAt: new Date(Date.now() - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        facility,
        projectedMetrics: {
          monthlyRevenue,
          totalReturn: monthlyRevenue * (proposalType === 'yep' ? 60 : 48),
          energySavings: facility.currentEnergyUsageKwh * projectedEnergySavings * 0.12, // $0.12/kWh
          co2Reduction: facility.currentEnergyUsageKwh * projectedEnergySavings * 0.0004 // tons CO2
        }
      };
      
      return proposal;
    });
    
    setProposals(proposalData);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Group proposals by status
  const proposalsByStatus = {
    draft: proposals.filter(p => p.status === 'draft'),
    submitted: proposals.filter(p => p.status === 'submitted'),
    under_review: proposals.filter(p => p.status === 'under_review'),
    approved: proposals.filter(p => p.status === 'approved'),
    rejected: proposals.filter(p => p.status === 'rejected')
  };

  const totalPotentialInvestment = proposals.reduce((sum, p) => sum + p.proposedInvestment, 0);
  const totalPotentialRevenue = proposals.reduce((sum, p) => sum + (p.projectedMetrics?.monthlyRevenue || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Deal Flow Management</h1>
          <p className="text-muted-foreground">Review and manage investment opportunities</p>
        </div>
        <Button size="lg">
          <FileText className="mr-2 h-4 w-4" />
          Create New Proposal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.length}</div>
            <p className="text-xs text-muted-foreground">
              {proposalsByStatus.under_review.length} under review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalPotentialInvestment / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              Across all opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalPotentialRevenue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              Combined all deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Opportunity Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(proposals.reduce((sum, p) => sum + p.opportunityScore, 0) / proposals.length).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 100
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deal Pipeline Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="approved">Approved Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          {/* Pipeline Stages */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {Object.entries(proposalsByStatus).map(([status, statusProposals]) => (
              <Card key={status} className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium capitalize">
                      {status.replace('_', ' ')}
                    </CardTitle>
                    <Badge variant="secondary">{statusProposals.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {statusProposals.map((proposal) => (
                    <Dialog key={proposal.id}>
                      <DialogTrigger asChild>
                        <Card 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedProposal(proposal)}
                        >
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <p className="text-sm font-medium line-clamp-1">
                                {proposal.facility?.name}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {proposal.proposalType.toUpperCase()}
                              </Badge>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>${(proposal.proposedInvestment / 1000).toFixed(0)}K</span>
                                <span>{proposal.opportunityScore.toFixed(0)}/100</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{proposal.facility?.name}</DialogTitle>
                          <DialogDescription>
                            Investment Proposal Details
                          </DialogDescription>
                        </DialogHeader>
                        <ProposalDetails proposal={proposal} />
                      </DialogContent>
                    </Dialog>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Table View */}
          <Card>
            <CardHeader>
              <CardTitle>All Opportunities</CardTitle>
              <CardDescription>Complete list of investment proposals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facility</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead>Projected IRR</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{proposal.facility?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {proposal.facility?.location}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          proposal.proposalType === 'gaas' ? 'default' :
                          proposal.proposalType === 'yep' ? 'secondary' : 'outline'
                        }>
                          {proposal.proposalType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>${(proposal.proposedInvestment / 1000).toFixed(0)}K</TableCell>
                      <TableCell>{(proposal.projectedIRR * 100).toFixed(1)}%</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={proposal.opportunityScore} className="w-16" />
                          <span className="text-sm">{proposal.opportunityScore.toFixed(0)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          proposal.status === 'approved' ? 'default' :
                          proposal.status === 'under_review' ? 'secondary' :
                          proposal.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {proposal.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{proposal.facility?.name}</DialogTitle>
                              <DialogDescription>
                                Investment Proposal Details
                              </DialogDescription>
                            </DialogHeader>
                            <ProposalDetails proposal={proposal} />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Investment Type Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Type Distribution</CardTitle>
                <CardDescription>Breakdown by deal structure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['gaas', 'yep', 'hybrid'].map((type) => {
                    const typeProposals = proposals.filter(p => p.proposalType === type);
                    const percentage = (typeProposals.length / proposals.length) * 100;
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium uppercase">{type}</span>
                          <span>{typeProposals.length} deals</span>
                        </div>
                        <Progress value={percentage} />
                        <p className="text-xs text-muted-foreground mt-1">
                          ${(typeProposals.reduce((sum, p) => sum + p.proposedInvestment, 0) / 1000000).toFixed(1)}M total
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Risk vs Return Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Risk vs Return Matrix</CardTitle>
                <CardDescription>Opportunity assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">High Return, Low Risk</h4>
                    <div className="space-y-1">
                      {proposals
                        .filter(p => p.projectedIRR > 0.25 && p.opportunityScore > 85)
                        .slice(0, 3)
                        .map(p => (
                          <p key={p.id} className="text-xs text-muted-foreground">
                            • {p.facility?.name}
                          </p>
                        ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Quick Wins</h4>
                    <div className="space-y-1">
                      {proposals
                        .filter(p => p.projectedPaybackMonths < 24 && p.projectedPaybackMonths > 0)
                        .slice(0, 3)
                        .map(p => (
                          <p key={p.id} className="text-xs text-muted-foreground">
                            • {p.facility?.name} ({p.projectedPaybackMonths}mo)
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Facility Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Facility Analysis</CardTitle>
              <CardDescription>Key metrics by facility type</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facility Type</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Avg Investment</TableHead>
                    <TableHead>Avg IRR</TableHead>
                    <TableHead>Avg Yield Improvement</TableHead>
                    <TableHead>Avg Energy Savings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {['greenhouse', 'indoor', 'vertical'].map((type) => {
                    const typeProposals = proposals.filter(p => p.facility?.facilityType === type);
                    if (typeProposals.length === 0) return null;
                    
                    return (
                      <TableRow key={type}>
                        <TableCell className="capitalize">{type}</TableCell>
                        <TableCell>{typeProposals.length}</TableCell>
                        <TableCell>
                          ${(typeProposals.reduce((sum, p) => sum + p.proposedInvestment, 0) / typeProposals.length / 1000).toFixed(0)}K
                        </TableCell>
                        <TableCell>
                          {(typeProposals.reduce((sum, p) => sum + p.projectedIRR, 0) / typeProposals.length * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          {(typeProposals.reduce((sum, p) => sum + p.projectedYieldImprovement, 0) / typeProposals.length).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          {(typeProposals.reduce((sum, p) => sum + p.projectedEnergySavings, 0) / typeProposals.length).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Deals</CardTitle>
              <CardDescription>Ready for contract execution</CardDescription>
            </CardHeader>
            <CardContent>
              {proposalsByStatus.approved.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No approved deals yet</p>
              ) : (
                <div className="space-y-4">
                  {proposalsByStatus.approved.map((proposal) => (
                    <Card key={proposal.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold">{proposal.facility?.name}</h3>
                            <div className="flex space-x-4 text-sm text-muted-foreground">
                              <span>{proposal.facility?.location}</span>
                              <span>•</span>
                              <span>{proposal.proposalType.toUpperCase()}</span>
                              <span>•</span>
                              <span>${(proposal.proposedInvestment / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="flex space-x-6 mt-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Projected IRR</p>
                                <p className="text-lg font-semibold">{(proposal.projectedIRR * 100).toFixed(1)}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                                <p className="text-lg font-semibold">
                                  ${proposal.projectedMetrics?.monthlyRevenue.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Payback Period</p>
                                <p className="text-lg font-semibold">
                                  {proposal.projectedPaybackMonths || 'Immediate'} months
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-x-2">
                            <Button variant="outline">
                              <FileText className="mr-2 h-4 w-4" />
                              Generate Contract
                            </Button>
                            <Button>
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Execute Deal
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for proposal details
function ProposalDetails({ proposal }: { proposal: DealFlowProposal }) {
  return (
    <div className="space-y-6">
      {/* Facility Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Facility Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="text-sm font-medium capitalize">{proposal.facility?.facilityType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Size</span>
              <span className="text-sm font-medium">{proposal.facility?.activeGrowSqft.toLocaleString()} sq ft</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Lighting</span>
              <span className="text-sm font-medium">{proposal.facility?.currentLightingType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Years Operating</span>
              <span className="text-sm font-medium">{proposal.facility?.yearsInOperation.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Investment Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="text-sm font-medium uppercase">{proposal.proposalType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Investment</span>
              <span className="text-sm font-medium">${proposal.proposedInvestment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Contract Length</span>
              <span className="text-sm font-medium">{proposal.proposedTerms.contractLength} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Revenue Share</span>
              <span className="text-sm font-medium">{proposal.proposedTerms.revenueShare || 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Financial Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">IRR</p>
              <p className="text-2xl font-bold">{(proposal.projectedIRR * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold">${(proposal.projectedMetrics?.monthlyRevenue || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Return</p>
              <p className="text-2xl font-bold">${((proposal.projectedMetrics?.totalReturn || 0) / 1000).toFixed(0)}K</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payback</p>
              <p className="text-2xl font-bold">{proposal.projectedPaybackMonths || 0} mo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Improvements */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expected Improvements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Yield Increase</span>
              </div>
              <span className="text-sm font-medium">+{proposal.projectedYieldImprovement.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Energy Reduction</span>
              </div>
              <span className="text-sm font-medium">-{proposal.projectedEnergySavings.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Annual Savings</span>
              </div>
              <span className="text-sm font-medium">${proposal.projectedMetrics?.energySavings.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Opportunity Score</span>
                <div className="flex items-center space-x-2">
                  <Progress value={proposal.opportunityScore} className="w-20" />
                  <span className="text-sm font-medium">{proposal.opportunityScore.toFixed(0)}/100</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{proposal.riskAssessment}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>AI Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{proposal.aiRecommendation}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function generateRiskAssessment(facility: Facility): string {
  const risks = [];
  
  if (facility.complianceScore < 80) risks.push('compliance concerns');
  if (facility.facilityConditionScore < 70) risks.push('facility maintenance needed');
  if (facility.yearsInOperation < 2) risks.push('limited operational history');
  if (facility.operatingMargin < 0.2) risks.push('thin profit margins');
  
  if (risks.length === 0) {
    return 'Low risk profile with strong fundamentals across all metrics.';
  }
  
  return `Moderate risk due to ${risks.join(', ')}. Mitigation strategies recommended.`;
}

function generateAIRecommendation(facility: Facility, projectedImprovement: number): string {
  const score = facility.complianceScore * 0.3 + 
                facility.facilityConditionScore * 0.3 + 
                (facility.yearsInOperation / 10) * 0.2 +
                projectedImprovement * 100 * 0.2;
  
  if (score > 80) {
    return `STRONG BUY - Excellent opportunity with ${(projectedImprovement * 100).toFixed(0)}% yield improvement potential. ${facility.currentLightingType === 'HPS' ? 'HPS to LED conversion offers significant energy savings.' : 'Modern facility with optimization potential.'}`;
  } else if (score > 60) {
    return `BUY - Good investment opportunity. ${facility.facilityConditionScore < 80 ? 'Consider facility improvements as part of investment.' : 'Strong operational metrics support growth potential.'}`;
  } else {
    return `HOLD - Acceptable opportunity but monitor risk factors. ${facility.yearsInOperation < 2 ? 'Limited operating history requires careful due diligence.' : 'Consider phased investment approach.'}`;
  }
}