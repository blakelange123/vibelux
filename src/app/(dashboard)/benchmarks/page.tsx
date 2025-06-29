'use client';

import { useState, useEffect } from 'react';
import { MarketDataForm } from '@/components/market-data/market-data-form';
import { BenchmarkReportViewer } from '@/components/benchmarks/benchmark-report-viewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  Download,
  Lock,
  Unlock,
  Trophy,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

export default function BenchmarksPage() {
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [facilities, setFacilities] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dataContributions, setDataContributions] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user's facilities
      const facilitiesRes = await fetch('/api/facilities');
      if (facilitiesRes.ok) {
        const facilitiesData = await facilitiesRes.json();
        setFacilities(facilitiesData);
        if (facilitiesData.length > 0 && !selectedFacility) {
          setSelectedFacility(facilitiesData[0].id);
        }
      }

      // Fetch benchmark subscription
      const subRes = await fetch('/api/benchmarks/subscription');
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (selectedFacility) {
      fetchFacilityData();
    }
  }, [selectedFacility]);

  const fetchFacilityData = async () => {
    try {
      // Fetch reports for facility
      const reportsRes = await fetch(`/api/benchmarks/generate?facilityId=${selectedFacility}`);
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports);
      }

      // Fetch data contributions
      const contribRes = await fetch(`/api/market-data/contributions?facilityId=${selectedFacility}`);
      if (contribRes.ok) {
        const contribData = await contribRes.json();
        setDataContributions(contribData);
      }
    } catch (error) {
      console.error('Error fetching facility data:', error);
    }
  };

  const handleGenerateReport = async (reportType: string) => {
    try {
      const response = await fetch('/api/benchmarks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: selectedFacility,
          reportType,
          period: 'monthly',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Report generated successfully');
        setSelectedReport(result.reportId);
        setActiveTab('report');
        fetchFacilityData(); // Refresh reports list
      } else {
        const error = await response.json();
        if (error.upgradeUrl) {
          toast.error(error.message, {
            action: {
              label: 'Upgrade',
              onClick: () => window.location.href = error.upgradeUrl,
            },
          });
        } else {
          toast.error('Failed to generate report');
        }
      }
    } catch (error) {
      toast.error('Error generating report');
      console.error(error);
    }
  };

  const handleBulkImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('facilityId', selectedFacility);
    formData.append('format', 'csv');

    try {
      const response = await fetch('/api/market-data/bulk-import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Imported ${result.summary.imported} records successfully`);
        fetchFacilityData();
      } else {
        toast.error('Failed to import data');
      }
    } catch (error) {
      toast.error('Error importing data');
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Industry Benchmarks</h1>
        <p className="text-gray-600 mt-2">
          Compare your performance against industry standards and unlock insights
        </p>
      </div>

      {/* Facility Selector */}
      <div className="flex items-center justify-between">
        <Select value={selectedFacility} onValueChange={setSelectedFacility}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a facility" />
          </SelectTrigger>
          <SelectContent>
            {facilities.map((facility) => (
              <SelectItem key={facility.id} value={facility.id}>
                {facility.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-4">
          <input
            type="file"
            id="bulk-import"
            accept=".csv"
            onChange={handleBulkImport}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('bulk-import')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button asChild variant="outline">
            <a href="/api/market-data/bulk-import" download>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </a>
          </Button>
        </div>
      </div>

      {/* Subscription Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {subscription?.tier === 'enterprise' ? 'Enterprise' : 
                 subscription?.tier === 'pro' ? 'Pro' : 'Basic'} Subscription
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {subscription ? `${subscription.reportsAccessed} reports generated this month` : 'Free tier'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {dataContributions && (
                <div className="text-center">
                  <p className="text-2xl font-bold">{dataContributions.totalContributions}</p>
                  <p className="text-sm text-gray-600">Data Points Shared</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-2xl font-bold">{dataContributions?.creditsEarned || 0}</p>
                <p className="text-sm text-gray-600">Credits Earned</p>
              </div>
            </div>
          </div>

          {/* Progress to next tier */}
          {dataContributions && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to unlock Pro reports</span>
                <span>{dataContributions.totalContributions}/50</span>
              </div>
              <Progress value={(dataContributions.totalContributions / 50) * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contribute">Contribute Data</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="report">View Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReportTypeCard
              title="Yield Benchmarks"
              description="Compare your yield per square foot against industry leaders"
              icon={<Leaf className="h-6 w-6" />}
              reportType="yield"
              tier="basic"
              isLocked={!subscription}
              onGenerate={handleGenerateReport}
            />
            <ReportTypeCard
              title="Energy Efficiency"
              description="Analyze energy consumption and identify savings opportunities"
              icon={<Zap className="h-6 w-6" />}
              reportType="energy"
              tier="basic"
              isLocked={!subscription}
              onGenerate={handleGenerateReport}
            />
            <ReportTypeCard
              title="Financial Performance"
              description="Revenue per square foot and profitability analysis"
              icon={<DollarSign className="h-6 w-6" />}
              reportType="financial"
              tier="pro"
              isLocked={!subscription || subscription.tier === 'basic'}
              onGenerate={handleGenerateReport}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Share data, unlock insights, improve performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-1">1. Share Your Data</h4>
                  <p className="text-sm text-gray-600">
                    Contribute market prices and operational metrics
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-1">2. Unlock Benchmarks</h4>
                  <p className="text-sm text-gray-600">
                    Access industry comparisons and rankings
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-1">3. Optimize Operations</h4>
                  <p className="text-sm text-gray-600">
                    Implement recommendations to improve performance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contribute">
          <MarketDataForm 
            facilityId={selectedFacility} 
            onSuccess={fetchFacilityData}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>View and download your benchmark reports</CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reports generated yet</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab('overview')}
                  >
                    Generate Your First Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedReport(report.id);
                        setActiveTab('report');
                      }}
                    >
                      <div>
                        <h4 className="font-medium">{report.reportType} Report</h4>
                        <p className="text-sm text-gray-600">
                          {report.facility.name} • {report.period} • {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Report
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report">
          {selectedReport ? (
            <BenchmarkReportViewer 
              reportId={selectedReport}
              facilityId={selectedFacility}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a report to view</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportTypeCard({ 
  title, 
  description, 
  icon, 
  reportType, 
  tier, 
  isLocked, 
  onGenerate 
}: any) {
  return (
    <Card className={isLocked ? 'opacity-75' : ''}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            {icon}
          </div>
          {isLocked ? (
            <Lock className="h-5 w-5 text-gray-400" />
          ) : (
            <Unlock className="h-5 w-5 text-green-500" />
          )}
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{tier}</Badge>
          <Button
            size="sm"
            disabled={isLocked}
            onClick={() => onGenerate(reportType)}
          >
            Generate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}