'use client';

import { useState, useEffect } from 'react';
import { PerformanceDrivenOptimizer } from '@/components/design/performance-driven-optimizer';
import { BenchmarkReportViewer } from '@/components/benchmarks/benchmark-report-viewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Sparkles, 
  ArrowRight, 
  TrendingUp,
  Settings,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function DesignOptimizePage() {
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [facilities, setFacilities] = useState<any[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [hasOptimization, setHasOptimization] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      checkBenchmarkData();
    }
  }, [selectedFacility]);

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities');
      if (response.ok) {
        const data = await response.json();
        setFacilities(data);
        if (data.length > 0 && !selectedFacility) {
          setSelectedFacility(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const checkBenchmarkData = async () => {
    try {
      const response = await fetch(`/api/benchmarks/generate?facilityId=${selectedFacility}`);
      if (response.ok) {
        const data = await response.json();
        if (data.reports && data.reports.length > 0) {
          // Fetch the latest benchmark report data
          setBenchmarkData(data.reports[0]);
          setWorkflowStep(2);
        } else {
          setBenchmarkData(null);
          setWorkflowStep(1);
        }
      }
    } catch (error) {
      console.error('Error checking benchmark data:', error);
    }
  };

  const generateBenchmarkReport = async () => {
    try {
      const response = await fetch('/api/benchmarks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: selectedFacility,
          reportType: 'comprehensive',
          period: 'monthly',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setBenchmarkData(result.data);
        setWorkflowStep(2);
        toast.success('Benchmark report generated successfully!');
      } else {
        toast.error('Failed to generate benchmark report');
      }
    } catch (error) {
      toast.error('Error generating benchmark report');
      console.error(error);
    }
  };

  const handleOptimizationGenerated = () => {
    setHasOptimization(true);
    setWorkflowStep(3);
    setActiveTab('optimization');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-600" />
          Performance-Driven Design Optimization
        </h1>
        <p className="text-gray-600 mt-2">
          Transform benchmark insights into actionable facility improvements
        </p>
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

            {/* Workflow Progress */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  workflowStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="text-sm">Benchmark</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  workflowStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className="text-sm">Analyze</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  workflowStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <span className="text-sm">Optimize</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="benchmark" disabled={!selectedFacility}>
            Benchmark Analysis
          </TabsTrigger>
          <TabsTrigger value="optimization" disabled={!benchmarkData}>
            Design Optimization
          </TabsTrigger>
          <TabsTrigger value="implementation" disabled={!hasOptimization}>
            Implementation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Performance Analysis */}
            <Card className={workflowStep >= 1 ? 'border-green-500' : 'border-gray-200'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Step 1: Performance Analysis
                </CardTitle>
                <CardDescription>
                  Generate comprehensive benchmark report
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workflowStep >= 1 ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Facility selected</span>
                    </div>
                    {benchmarkData ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Benchmark data available</span>
                      </div>
                    ) : (
                      <Button onClick={generateBenchmarkReport} size="sm" className="w-full">
                        Generate Benchmark
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Select a facility to begin</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Gap Analysis */}
            <Card className={workflowStep >= 2 ? 'border-green-500' : 'border-gray-200'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Step 2: Gap Analysis
                </CardTitle>
                <CardDescription>
                  Identify improvement opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workflowStep >= 2 ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Performance gaps identified</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Yield Gap:</span>
                        <span className="text-orange-600 ml-1">-15%</span>
                      </div>
                      <div>
                        <span className="font-medium">Energy Gap:</span>
                        <span className="text-red-600 ml-1">+25%</span>
                      </div>
                    </div>
                    <Button onClick={() => setActiveTab('optimization')} size="sm" className="w-full">
                      View Analysis
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Complete Step 1 first</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Design Optimization */}
            <Card className={workflowStep >= 3 ? 'border-green-500' : 'border-gray-200'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Step 3: Design Optimization
                </CardTitle>
                <CardDescription>
                  Generate improvement recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasOptimization ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Optimization complete</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">ROI:</span>
                        <span className="text-green-600 ml-1">285%</span>
                      </div>
                      <div>
                        <span className="font-medium">Payback:</span>
                        <span className="text-blue-600 ml-1">8 months</span>
                      </div>
                    </div>
                    <Button onClick={() => setActiveTab('implementation')} size="sm" className="w-full">
                      View Plan
                    </Button>
                  </div>
                ) : workflowStep >= 2 ? (
                  <div className="text-center py-4">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-sm text-gray-600 mb-3">Ready to optimize</p>
                    <Button onClick={() => setActiveTab('optimization')} size="sm" className="w-full">
                      Start Optimization
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Complete previous steps</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Benefits Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Why Performance-Driven Design?</CardTitle>
              <CardDescription>
                Transform your facility based on real performance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Data-Driven Decisions</h4>
                  <p className="text-sm text-gray-600">
                    Base improvements on actual performance metrics, not assumptions
                  </p>
                </div>
                <div className="text-center">
                  <Target className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Targeted Improvements</h4>
                  <p className="text-sm text-gray-600">
                    Focus investment on areas with highest impact potential
                  </p>
                </div>
                <div className="text-center">
                  <Zap className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Proven ROI</h4>
                  <p className="text-sm text-gray-600">
                    Every recommendation comes with projected return calculations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmark" className="space-y-4">
          {benchmarkData ? (
            <BenchmarkReportViewer 
              facilityId={selectedFacility}
              reportId={benchmarkData.id}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Generate Benchmark Report</h3>
                <p className="text-gray-600 mb-4">
                  Create a comprehensive performance analysis to identify optimization opportunities
                </p>
                <Button onClick={generateBenchmarkReport}>
                  Generate Benchmark Report
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          {benchmarkData ? (
            <PerformanceDrivenOptimizer 
              facilityId={selectedFacility}
              benchmarkData={benchmarkData}
            />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Generate a benchmark report first to enable performance-driven optimization.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Support</CardTitle>
              <CardDescription>
                Tools and resources to execute your optimization plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Implementation Tracking</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Project timeline management</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Budget tracking and alerts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Performance impact monitoring</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>ROI verification reports</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Expert Support</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>Vendor recommendations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>Technical consultation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>Installation guidance</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>Performance validation</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex space-x-4">
                  <Button className="flex-1">
                    Start Implementation
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Schedule Consultation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}