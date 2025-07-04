'use client';

import { useState, useEffect } from 'react';
import { ReportCustomizer } from '@/components/benchmarks/report-customizer';
import { InteractiveAnalyticsDashboard } from '@/components/benchmarks/interactive-analytics-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sparkles, 
  Download, 
  Share2, 
  Calendar,
  BarChart3,
  Brain,
  Settings,
  Zap,
  Crown,
  Rocket
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedBenchmarksPage() {
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [facilities, setFacilities] = useState<any[]>([]);
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('customize');
  const [isGenerating, setIsGenerating] = useState(false);

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

      // Fetch subscription status
      const subRes = await fetch('/api/benchmarks/subscription');
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleGenerateCustomReport = async (config: any) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/benchmarks/generate-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentReport(result.reportId);
        setReportData(result.data);
        setActiveTab('analytics');
        toast.success('Advanced report generated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to generate report');
      }
    } catch (error) {
      toast.error('Error generating report');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = async (format: string) => {
    if (!currentReport) {
      toast.error('No report to export');
      return;
    }

    try {
      const response = await fetch('/api/benchmarks/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: currentReport,
          format,
          options: {},
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `benchmark-report.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Report exported as ${format.toUpperCase()}`);
      } else {
        toast.error('Failed to export report');
      }
    } catch (error) {
      toast.error('Error exporting report');
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-600" />
            Advanced Analytics Suite
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered insights, predictive analytics, and custom reporting
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            {subscription?.tier || 'Free'} Plan
          </Badge>
          
          {currentReport && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportReport('pdf')}
              >
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportReport('excel')}
              >
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Facility Selector */}
      <Card>
        <CardContent className="p-4">
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

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>AI Enabled</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Real-time Insights</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <Badge variant="secondary">Pro</Badge>
            </div>
            <h3 className="font-semibold mb-2">Custom Metrics</h3>
            <p className="text-sm text-gray-600">
              Create your own KPIs with mathematical formulas
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <Badge variant="secondary">AI</Badge>
            </div>
            <h3 className="font-semibold mb-2">Predictive Analytics</h3>
            <p className="text-sm text-gray-600">
              30-day forecasts with confidence intervals
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Settings className="h-8 w-8 text-green-600" />
              <Badge variant="secondary">Enterprise</Badge>
            </div>
            <h3 className="font-semibold mb-2">What-If Scenarios</h3>
            <p className="text-sm text-gray-600">
              Model changes and see projected outcomes
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Rocket className="h-8 w-8 text-orange-600" />
              <Badge variant="secondary">Real-time</Badge>
            </div>
            <h3 className="font-semibold mb-2">Live Monitoring</h3>
            <p className="text-sm text-gray-600">
              Real-time KPI tracking and alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customize" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Report Builder
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2" disabled={!reportData}>
            <BarChart3 className="h-4 w-4" />
            Interactive Analytics
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customize" className="space-y-6">
          <ReportCustomizer 
            facilityId={selectedFacility}
            onGenerate={handleGenerateCustomReport}
          />
          
          {isGenerating && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Generating Advanced Report</h3>
                <p className="text-gray-600">
                  Running AI analysis, calculating predictions, and detecting anomalies...
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {reportData ? (
            <InteractiveAnalyticsDashboard 
              reportData={reportData}
              customization={currentReport}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Report Generated</h3>
                <p className="text-gray-600 mb-4">
                  Create a custom report to access interactive analytics
                </p>
                <Button onClick={() => setActiveTab('customize')}>
                  Build Report
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automated Reporting</CardTitle>
              <CardDescription>
                Schedule reports to be generated and delivered automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-gray-600">
                    Automated scheduling and delivery will be available in the next update
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-purple-50">
                  <h4 className="font-semibold mb-2">Planned Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Daily, weekly, monthly, and quarterly schedules</li>
                    <li>• Email delivery to stakeholder lists</li>
                    <li>• Slack and Teams integration</li>
                    <li>• API webhooks for custom integrations</li>
                    <li>• Alert-based reporting triggers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Prompt for Free Users */}
      {(!subscription || subscription.tier === 'basic') && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-900">
                  Unlock Advanced Analytics
                </h3>
                <p className="text-purple-700 mt-1">
                  Get AI predictions, custom metrics, and real-time insights
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline">
                  Learn More
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Upgrade Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}