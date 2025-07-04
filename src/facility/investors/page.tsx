'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  Share,
  MessageCircle,
  FileText,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  Briefcase,
  Target,
  BarChart3
} from 'lucide-react';

interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: 'individual' | 'institutional' | 'corporate';
  location: string;
  investmentAmount: number;
  investmentDate: string;
  status: 'active' | 'pending' | 'inactive';
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  portfolioValue: number;
  lastContact: string;
  communicationPreference: 'email' | 'phone' | 'both';
  notes: string;
  avatar?: string;
  totalInvestments: number;
  averageReturn: number;
}

const mockInvestors: Investor[] = [
  {
    id: '1',
    name: 'Robert Chen',
    email: 'robert.chen@email.com',
    phone: '+1 (555) 123-4567',
    company: 'Chen Capital Partners',
    type: 'institutional',
    location: 'San Francisco, CA',
    investmentAmount: 500000,
    investmentDate: '2023-06-15',
    status: 'active',
    riskProfile: 'moderate',
    portfolioValue: 650000,
    lastContact: '2024-01-15',
    communicationPreference: 'email',
    notes: 'Interested in expanding investment in Q2 2024. Prefers quarterly reports.',
    totalInvestments: 3,
    averageReturn: 18.5
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@gmail.com',
    phone: '+1 (555) 234-5678',
    type: 'individual',
    location: 'Denver, CO',
    investmentAmount: 75000,
    investmentDate: '2023-09-22',
    status: 'active',
    riskProfile: 'conservative',
    portfolioValue: 82500,
    lastContact: '2024-01-10',
    communicationPreference: 'both',
    notes: 'First-time cannabis investor. Requires frequent updates and education.',
    totalInvestments: 1,
    averageReturn: 12.3
  },
  {
    id: '3',
    name: 'Green Valley Fund',
    email: 'investments@greenvalley.com',
    phone: '+1 (555) 345-6789',
    company: 'Green Valley Investment Fund',
    type: 'institutional',
    location: 'Los Angeles, CA',
    investmentAmount: 1200000,
    investmentDate: '2023-03-10',
    status: 'active',
    riskProfile: 'aggressive',
    portfolioValue: 1440000,
    lastContact: '2024-01-18',
    communicationPreference: 'email',
    notes: 'Major institutional investor. Looking for additional opportunities.',
    totalInvestments: 5,
    averageReturn: 22.1
  },
  {
    id: '4',
    name: 'Michael Rodriguez',
    email: 'mrodriguez@techcorp.com',
    phone: '+1 (555) 456-7890',
    company: 'TechCorp Ventures',
    type: 'corporate',
    location: 'Austin, TX',
    investmentAmount: 250000,
    investmentDate: '2023-11-05',
    status: 'pending',
    riskProfile: 'moderate',
    portfolioValue: 250000,
    lastContact: '2024-01-08',
    communicationPreference: 'phone',
    notes: 'Pending completion of due diligence process.',
    totalInvestments: 1,
    averageReturn: 0
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@email.com',
    phone: '+1 (555) 567-8901',
    type: 'individual',
    location: 'Seattle, WA',
    investmentAmount: 150000,
    investmentDate: '2023-08-14',
    status: 'active',
    riskProfile: 'aggressive',
    portfolioValue: 178500,
    lastContact: '2024-01-12',
    communicationPreference: 'email',
    notes: 'Tech industry executive interested in cannabis sector diversification.',
    totalInvestments: 2,
    averageReturn: 15.8
  }
];

const investorTypes = {
  individual: { label: 'Individual', icon: Users, color: 'text-blue-500' },
  institutional: { label: 'Institutional', icon: Building2, color: 'text-purple-500' },
  corporate: { label: 'Corporate', icon: Briefcase, color: 'text-green-500' }
};

const statusColors = {
  active: 'text-green-500 bg-green-500/20',
  pending: 'text-yellow-500 bg-yellow-500/20',
  inactive: 'text-gray-500 bg-gray-500/20'
};

const riskColors = {
  conservative: 'text-blue-500 bg-blue-500/20',
  moderate: 'text-yellow-500 bg-yellow-500/20',
  aggressive: 'text-red-500 bg-red-500/20'
};

export default function FacilityInvestors() {
  const [investors, setInvestors] = useState(mockInvestors);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (investor.company && investor.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || investor.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || investor.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalInvestment = investors.reduce((sum, investor) => sum + investor.investmentAmount, 0);
  const totalPortfolioValue = investors.reduce((sum, investor) => sum + investor.portfolioValue, 0);
  const activeInvestors = investors.filter(inv => inv.status === 'active').length;
  const averageReturn = investors.reduce((sum, investor) => sum + investor.averageReturn, 0) / investors.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Investor Relations</h1>
          <p className="text-gray-300 mt-2">Manage relationships with facility investors and stakeholders</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Investor
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Investment</p>
                <p className="text-3xl font-bold mt-2 text-white">
                  ${(totalInvestment / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-green-500 mt-1">+23.4% this year</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Portfolio Value</p>
                <p className="text-3xl font-bold mt-2 text-white">
                  ${(totalPortfolioValue / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-green-500 mt-1">+18.2% growth</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Active Investors</p>
                <p className="text-3xl font-bold mt-2 text-white">{activeInvestors}</p>
                <p className="text-sm text-green-500 mt-1">3 new this quarter</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Avg Return</p>
                <p className="text-3xl font-bold mt-2 text-white">{averageReturn.toFixed(1)}%</p>
                <p className="text-sm text-green-500 mt-1">Above target</p>
              </div>
              <Target className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Search and Filters */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search investors by name, email, or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="institutional">Institutional</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investors List */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Investors ({filteredInvestors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInvestors.map((investor) => {
                  const TypeIcon = investorTypes[investor.type].icon;
                  return (
                    <div key={investor.id} className="flex items-center justify-between p-4 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={investor.avatar} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {investor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-white">{investor.name}</h3>
                            <TypeIcon className={`h-4 w-4 ${investorTypes[investor.type].color}`} />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[investor.status]}`}>
                              {investor.status.charAt(0).toUpperCase() + investor.status.slice(1)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColors[investor.riskProfile]}`}>
                              {investor.riskProfile.charAt(0).toUpperCase() + investor.riskProfile.slice(1)} Risk
                            </span>
                          </div>
                          {investor.company && (
                            <p className="text-sm text-gray-400 mt-1">{investor.company}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {investor.location}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ${investor.investmentAmount.toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {investor.averageReturn.toFixed(1)}% return
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Last contact: {investor.lastContact}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedInvestor(investor)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Communication Center</CardTitle>
              <CardDescription className="text-gray-300">
                Send updates and communicate with investors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4 text-center">
                    <Mail className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-medium text-white">Send Update</h3>
                    <p className="text-sm text-gray-400 mt-1">Quarterly performance update</p>
                    <Button size="sm" className="mt-3">Send Email</Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h3 className="font-medium text-white">Financial Report</h3>
                    <p className="text-sm text-gray-400 mt-1">Generate investor report</p>
                    <Button size="sm" className="mt-3">Generate</Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h3 className="font-medium text-white">Schedule Meeting</h3>
                    <p className="text-sm text-gray-400 mt-1">Investor relations call</p>
                    <Button size="sm" className="mt-3">Schedule</Button>
                  </CardContent>
                </Card>
              </div>

              <div className="border border-gray-600 rounded-lg p-4">
                <h3 className="font-medium text-white mb-4">Recent Communications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <div>
                      <p className="text-white">Q4 Performance Update</p>
                      <p className="text-sm text-gray-400">Sent to all active investors • Jan 20, 2024</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <div>
                      <p className="text-white">Individual Meeting - Robert Chen</p>
                      <p className="text-sm text-gray-400">Scheduled for Jan 25, 2024</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Investor Reports</CardTitle>
              <CardDescription className="text-gray-300">
                Generate and manage investor reports and documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-white">Available Reports</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-600 rounded">
                      <div>
                        <p className="text-white">Monthly Performance Report</p>
                        <p className="text-sm text-gray-400">Investment performance and metrics</p>
                      </div>
                      <Button size="sm">Generate</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-600 rounded">
                      <div>
                        <p className="text-white">Quarterly Financial Statement</p>
                        <p className="text-sm text-gray-400">Detailed financial breakdown</p>
                      </div>
                      <Button size="sm">Generate</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-600 rounded">
                      <div>
                        <p className="text-white">Annual Impact Report</p>
                        <p className="text-sm text-gray-400">Environmental and social impact</p>
                      </div>
                      <Button size="sm">Generate</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-white">Recent Reports</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <div>
                        <p className="text-white">Q4 2023 Performance Report</p>
                        <p className="text-sm text-gray-400">Generated Jan 15, 2024</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <div>
                        <p className="text-white">2023 Annual Report</p>
                        <p className="text-sm text-gray-400">Generated Dec 31, 2023</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Investor Analytics</CardTitle>
              <CardDescription className="text-gray-300">
                Analytics and insights about your investor portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-white">Investor Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Individual Investors</span>
                      <span className="text-white">40%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Institutional Investors</span>
                      <span className="text-white">40%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Corporate Investors</span>
                      <span className="text-white">20%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-white">Investment Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Average Investment Size</span>
                      <span className="text-white">$435K</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Retention Rate</span>
                      <span className="text-white">94%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Avg. Holding Period</span>
                      <span className="text-white">18 months</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}