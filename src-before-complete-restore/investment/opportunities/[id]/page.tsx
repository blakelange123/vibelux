'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Zap,
  Calendar,
  Users,
  Target,
  FileText,
  Download,
  Play,
  ChevronLeft,
  Shield,
  Award,
  Leaf,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Calculator,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

// Extended opportunity interface with more details
interface DetailedOpportunity {
  id: string;
  facilityName: string;
  location: string;
  facilityType: 'INDOOR_FARM' | 'GREENHOUSE' | 'VERTICAL_FARM';
  investmentType: 'GAAS' | 'YEP' | 'HYBRID';
  minimumInvestment: number;
  targetRaise: number;
  currentRaised: number;
  totalInvestors: number;
  targetIRR: number;
  paybackPeriod: number;
  status: 'OPEN' | 'CLOSING_SOON' | 'FUNDED';
  closingDate: string;
  description: string;
  
  // Extended details
  executiveSummary: string;
  facilityDetails: {
    totalSquareFeet: number;
    growingSquareFeet: number;
    constructionStatus: string;
    operationalDate: string;
    certifications: string[];
    technology: string[];
  };
  
  financials: {
    projectedRevenue: number[];
    projectedExpenses: number[];
    projectedEBITDA: number[];
    capitalStructure: {
      equity: number;
      debt: number;
      grants: number;
    };
  };
  
  management: {
    ceo: { name: string; experience: string; linkedin?: string };
    cto: { name: string; experience: string; linkedin?: string };
    advisors: { name: string; role: string; expertise: string }[];
  };
  
  risks: {
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    factors: { category: string; description: string; mitigation: string }[];
  };
  
  documents: {
    name: string;
    type: 'PITCH_DECK' | 'FINANCIALS' | 'LEGAL' | 'TECHNICAL';
    size: string;
    restricted: boolean;
  }[];
  
  terms: {
    structure: string;
    liquidationPreference: string;
    distributionSchedule: string;
    minimumReturn: number;
    managementFee: number;
    exitStrategy: string;
  };
}

// Mock detailed data
const getDetailedOpportunity = (id: string): DetailedOpportunity => ({
  id,
  facilityName: 'AeroGreen Technologies',
  location: 'Columbus, OH',
  facilityType: 'VERTICAL_FARM',
  investmentType: 'GAAS',
  minimumInvestment: 50000,
  targetRaise: 2500000,
  currentRaised: 1750000,
  totalInvestors: 23,
  targetIRR: 22,
  paybackPeriod: 4.5,
  status: 'CLOSING_SOON',
  closingDate: '2024-07-15',
  description: 'State-of-the-art vertical farming facility specializing in leafy greens with confirmed off-take agreements.',
  
  executiveSummary: `AeroGreen Technologies is developing a 45,000 sq ft vertical farming facility in Columbus, Ohio, 
  positioned to serve the growing demand for locally-grown, pesticide-free produce in the Midwest market. 
  With proprietary aeroponic technology and AI-driven climate control, we project 30% higher yields than traditional indoor farms 
  while using 40% less energy. The facility has secured long-term purchase agreements with Kroger and Whole Foods, 
  ensuring stable revenue from day one of operations.`,
  
  facilityDetails: {
    totalSquareFeet: 45000,
    growingSquareFeet: 38000,
    constructionStatus: '65% Complete',
    operationalDate: '2024-09-01',
    certifications: ['USDA Organic', 'SQF Certified', 'GLOBALG.A.P.'],
    technology: [
      'Proprietary aeroponic system',
      'AI-powered climate control',
      'LED spectrum optimization',
      'Automated seeding and harvesting',
      'Blockchain traceability'
    ]
  },
  
  financials: {
    projectedRevenue: [0, 2100000, 4500000, 6800000, 8200000],
    projectedExpenses: [1500000, 1800000, 3200000, 4500000, 5200000],
    projectedEBITDA: [-1500000, 300000, 1300000, 2300000, 3000000],
    capitalStructure: {
      equity: 2500000,
      debt: 1500000,
      grants: 500000
    }
  },
  
  management: {
    ceo: {
      name: 'Sarah Chen',
      experience: '15 years in AgTech, former VP at BrightFarms',
      linkedin: 'linkedin.com/in/sarahchen'
    },
    cto: {
      name: 'Dr. Michael Torres',
      experience: 'PhD in Plant Science, 10 years in vertical farming R&D',
      linkedin: 'linkedin.com/in/drmtorres'
    },
    advisors: [
      {
        name: 'John Smith',
        role: 'Strategic Advisor',
        expertise: 'Former CEO of Fresh Direct'
      },
      {
        name: 'Dr. Lisa Wang',
        role: 'Technical Advisor',
        expertise: 'MIT Professor, hydroponics expert'
      }
    ]
  },
  
  risks: {
    level: 'LOW',
    factors: [
      {
        category: 'Market Risk',
        description: 'Competition from traditional farming',
        mitigation: 'Long-term contracts with major retailers locked in'
      },
      {
        category: 'Operational Risk',
        description: 'Technology failures or crop disease',
        mitigation: 'Redundant systems and comprehensive insurance'
      },
      {
        category: 'Financial Risk',
        description: 'Higher than projected operating costs',
        mitigation: '20% contingency built into financial model'
      }
    ]
  },
  
  documents: [
    { name: 'Investment Deck', type: 'PITCH_DECK', size: '8.2 MB', restricted: false },
    { name: 'Financial Projections', type: 'FINANCIALS', size: '2.1 MB', restricted: false },
    { name: 'Purchase Agreements', type: 'LEGAL', size: '1.5 MB', restricted: true },
    { name: 'Technical Specifications', type: 'TECHNICAL', size: '5.3 MB', restricted: false }
  ],
  
  terms: {
    structure: 'Revenue Share Agreement',
    liquidationPreference: '1.2x non-participating',
    distributionSchedule: 'Monthly after 6-month ramp period',
    minimumReturn: 8,
    managementFee: 2,
    exitStrategy: 'Buy-back option after 5 years at 2.5x multiple'
  }
});

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<DetailedOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [investmentAmount, setInvestmentAmount] = useState(50000);
  const [showInvestDialog, setShowInvestDialog] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOpportunity(getDetailedOpportunity(params.id as string));
      setLoading(false);
    }, 500);
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Opportunity not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const progressPercentage = (opportunity.currentRaised / opportunity.targetRaise) * 100;
  const daysUntilClose = Math.ceil((new Date(opportunity.closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate projected returns
  const projectedReturns = investmentAmount * (1 + opportunity.targetIRR / 100);
  const monthlyDistribution = (investmentAmount * (opportunity.targetIRR / 100)) / 12;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/investment/opportunities">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Opportunities
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Deck
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Call
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{opportunity.facilityName}</CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {opportunity.location}
                    </div>
                    <Badge variant="outline">{opportunity.facilityType.replace('_', ' ')}</Badge>
                    <Badge className="bg-green-500">
                      {opportunity.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{opportunity.executiveSummary}</p>
              
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-2xl font-bold">{opportunity.targetIRR}%</p>
                  <p className="text-xs text-muted-foreground">Target IRR</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-2xl font-bold">{opportunity.paybackPeriod}</p>
                  <p className="text-xs text-muted-foreground">Years Payback</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-2xl font-bold">{opportunity.facilityDetails.totalSquareFeet.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Square Feet</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Users className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <p className="text-2xl font-bold">{opportunity.totalInvestors}</p>
                  <p className="text-xs text-muted-foreground">Investors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="facility">Facility</TabsTrigger>
                  <TabsTrigger value="financials">Financials</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="risks">Risks</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Investment Structure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-medium">{opportunity.terms.structure}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Minimum Return</span>
                          <span className="font-medium">{opportunity.terms.minimumReturn}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Management Fee</span>
                          <span className="font-medium">{opportunity.terms.managementFee}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Distribution</span>
                          <span className="font-medium">{opportunity.terms.distributionSchedule}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Exit Strategy</span>
                          <span className="font-medium">{opportunity.terms.exitStrategy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Liquidation Pref</span>
                          <span className="font-medium">{opportunity.terms.liquidationPreference}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Why Invest?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Confirmed Off-take Agreements</p>
                          <p className="text-sm text-muted-foreground">Long-term contracts with major retailers</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Experienced Team</p>
                          <p className="text-sm text-muted-foreground">15+ years in AgTech and operations</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Proprietary Technology</p>
                          <p className="text-sm text-muted-foreground">30% higher yields than competitors</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Strategic Location</p>
                          <p className="text-sm text-muted-foreground">Near major distribution centers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="facility" className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Facility Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Square Feet</p>
                        <p className="font-medium">{opportunity.facilityDetails.totalSquareFeet.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Growing Square Feet</p>
                        <p className="font-medium">{opportunity.facilityDetails.growingSquareFeet.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Construction Status</p>
                        <p className="font-medium">{opportunity.facilityDetails.constructionStatus}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Operational Date</p>
                        <p className="font-medium">{new Date(opportunity.facilityDetails.operationalDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Technology Stack</h3>
                    <div className="space-y-2">
                      {opportunity.facilityDetails.technology.map((tech, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span>{tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.facilityDetails.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline">
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="financials" className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">5-Year Financial Projections</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Year</th>
                            <th className="text-right py-2">Revenue</th>
                            <th className="text-right py-2">Expenses</th>
                            <th className="text-right py-2">EBITDA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {opportunity.financials.projectedRevenue.map((revenue, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">Year {index + 1}</td>
                              <td className="text-right">${revenue.toLocaleString()}</td>
                              <td className="text-right">${opportunity.financials.projectedExpenses[index].toLocaleString()}</td>
                              <td className={`text-right font-medium ${opportunity.financials.projectedEBITDA[index] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${opportunity.financials.projectedEBITDA[index].toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Capital Structure</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Equity</span>
                        <span className="font-medium">${opportunity.financials.capitalStructure.equity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debt</span>
                        <span className="font-medium">${opportunity.financials.capitalStructure.debt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Grants</span>
                        <span className="font-medium">${opportunity.financials.capitalStructure.grants.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>
                          ${(
                            opportunity.financials.capitalStructure.equity +
                            opportunity.financials.capitalStructure.debt +
                            opportunity.financials.capitalStructure.grants
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="team" className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Leadership Team</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{opportunity.management.ceo.name}</p>
                            <p className="text-sm text-muted-foreground">Chief Executive Officer</p>
                            <p className="text-sm mt-1">{opportunity.management.ceo.experience}</p>
                          </div>
                          {opportunity.management.ceo.linkedin && (
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{opportunity.management.cto.name}</p>
                            <p className="text-sm text-muted-foreground">Chief Technology Officer</p>
                            <p className="text-sm mt-1">{opportunity.management.cto.experience}</p>
                          </div>
                          {opportunity.management.cto.linkedin && (
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Advisory Board</h3>
                    <div className="space-y-3">
                      {opportunity.management.advisors.map((advisor, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">{advisor.name}</p>
                            <p className="text-sm text-muted-foreground">{advisor.role}</p>
                            <p className="text-sm">{advisor.expertise}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="risks" className="mt-6 space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      All investments carry risk. Please review carefully and consult with your financial advisor.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold">Risk Assessment</h3>
                      <Badge className={
                        opportunity.risks.level === 'LOW' ? 'bg-green-500' :
                        opportunity.risks.level === 'MEDIUM' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }>
                        {opportunity.risks.level} RISK
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      {opportunity.risks.factors.map((risk, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium">{risk.category}</p>
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                          <div className="flex items-start gap-2">
                            <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                            <p className="text-sm">
                              <span className="font-medium">Mitigation:</span> {risk.mitigation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Download due diligence materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {opportunity.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.type.replace('_', ' ')} • {doc.size}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={doc.restricted}
                    >
                      {doc.restricted ? (
                        <>
                          <Shield className="w-4 h-4 mr-1" />
                          Restricted
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Investment Action */}
        <div className="space-y-6">
          {/* Funding Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>Funding Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{progressPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>${opportunity.currentRaised.toLocaleString()} raised</span>
                  <span>${opportunity.targetRaise.toLocaleString()} target</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Investors</p>
                  <p className="text-xl font-semibold">{opportunity.totalInvestors}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Left</p>
                  <p className="text-xl font-semibold">{daysUntilClose}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Investment Terms</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum</span>
                    <span className="font-medium">${opportunity.minimumInvestment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target IRR</span>
                    <span className="font-medium text-green-600">{opportunity.targetIRR}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{opportunity.investmentType}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Calculator */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Calculator</CardTitle>
              <CardDescription>Calculate your potential returns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Investment Amount</Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    min={opportunity.minimumInvestment}
                    step={1000}
                  />
                </div>
                <Slider
                  value={[investmentAmount]}
                  onValueChange={([value]) => setInvestmentAmount(value)}
                  min={opportunity.minimumInvestment}
                  max={500000}
                  step={5000}
                  className="mt-3"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Projected Annual Return</span>
                  <span className="font-medium text-green-600">
                    ${((investmentAmount * opportunity.targetIRR) / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Distribution</span>
                  <span className="font-medium">${monthlyDistribution.toFixed(0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total at Maturity</span>
                  <span className="font-medium">
                    ${(investmentAmount * (1 + (opportunity.targetIRR / 100) * opportunity.paybackPeriod)).toLocaleString()}
                  </span>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Projections are estimates based on target returns and are not guaranteed.
                </AlertDescription>
              </Alert>

              <Dialog open={showInvestDialog} onOpenChange={setShowInvestDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Invest ${investmentAmount.toLocaleString()}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Complete Investment</DialogTitle>
                    <DialogDescription>
                      You are about to invest ${investmentAmount.toLocaleString()} in {opportunity.facilityName}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your investment will be processed through our secure Stripe platform.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Next Steps:</p>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Review and sign investment agreement</li>
                        <li>Complete accreditation verification</li>
                        <li>Fund investment via ACH or wire</li>
                        <li>Receive confirmation and access to investor portal</li>
                      </ol>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowInvestDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => router.push(`/investment/checkout/${opportunity.id}?amount=${investmentAmount}`)}>
                      Continue to Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule a Call
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Facility Tour
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Request More Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}