'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  Eye, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Target,
  Zap,
  BarChart3,
  Clock,
  Star,
  Lightbulb,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedReport {
  id: string;
  title: string;
  reportType: string;
  timeframe: string;
  audience: string;
  executiveSummary: string;
  wordCount: number;
  confidenceLevel: number;
  dataQuality: number;
  createdAt: string;
}

interface IntelligentReportDashboardProps {
  facilityId: string;
  facilityName: string;
}

export function IntelligentReportDashboard({ facilityId, facilityName }: IntelligentReportDashboardProps) {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  // Report generation parameters
  const [reportType, setReportType] = useState('performance');
  const [timeframe, setTimeframe] = useState('30d');
  const [audience, setAudience] = useState('operations');

  useEffect(() => {
    fetchReports();
  }, [facilityId]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/generate-report?facilityId=${facilityId}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        throw new Error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId,
          reportType,
          timeframe,
          audience
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedReport(data.report);
        await fetchReports(); // Refresh the list
        toast.success('Intelligent report generated successfully!');
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const reportTypeOptions = [
    { value: 'performance', label: 'Performance Analysis', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'benchmark', label: 'Benchmark Report', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'optimization', label: 'Optimization Analysis', icon: <Zap className="w-4 h-4" /> },
    { value: 'executive', label: 'Executive Summary', icon: <Star className="w-4 h-4" /> },
    { value: 'compliance', label: 'Compliance Report', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'technical', label: 'Technical Analysis', icon: <Brain className="w-4 h-4" /> }
  ];

  const timeframeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const audienceOptions = [
    { value: 'executive', label: 'Executive Leadership' },
    { value: 'operations', label: 'Operations Team' },
    { value: 'technical', label: 'Technical Staff' },
    { value: 'investor', label: 'Investors' },
    { value: 'regulatory', label: 'Regulatory/Compliance' }
  ];

  const getReportTypeIcon = (type: string) => {
    const option = reportTypeOptions.find(opt => opt.value === type);
    return option?.icon || <FileText className="w-4 h-4" />;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge className="bg-green-100 text-green-800">High Confidence</Badge>;
    if (confidence >= 0.6) return <Badge className="bg-yellow-100 text-yellow-800">Medium Confidence</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low Confidence</Badge>;
  };

  const getDataQualityColor = (quality: number) => {
    if (quality >= 0.8) return 'text-green-600';
    if (quality >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Intelligent Reports
          </h1>
          <p className="text-gray-600 mt-2">
            AI-generated insights and analysis for {facilityName}
          </p>
        </div>
        
        <Badge variant="outline" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Powered by Claude AI
        </Badge>
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate New Report
          </CardTitle>
          <CardDescription>
            Create intelligent, data-driven reports with AI-generated insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Audience</label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audienceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateReport} 
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Generating Intelligent Report...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Report View */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getReportTypeIcon(selectedReport.reportType)}
                  {selectedReport.title}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  {getConfidenceBadge(selectedReport.metadata.confidenceLevel)}
                  <span className={`text-sm ${getDataQualityColor(selectedReport.metadata.dataQuality)}`}>
                    Data Quality: {(selectedReport.metadata.dataQuality * 100).toFixed(0)}%
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedReport.metadata.wordCount} words
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Full View
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                <TabsTrigger value="insights">Key Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="data">Supporting Data</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="mt-4">
                <div className="prose max-w-none">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Executive Summary</h4>
                    <p className="text-blue-800 whitespace-pre-line">{selectedReport.executiveSummary}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="insights" className="mt-4">
                <div className="space-y-4">
                  {selectedReport.insights?.map((insight: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            {insight.type === 'opportunity' && <Target className="w-4 h-4 text-green-600" />}
                            {insight.type === 'risk' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                            {insight.type === 'trend' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                            {insight.type === 'achievement' && <Star className="w-4 h-4 text-yellow-600" />}
                            {insight.title}
                          </h4>
                          <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2">{insight.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Confidence:</span>
                          <Progress value={insight.confidence * 100} className="w-20 h-2" />
                          <span className="text-sm text-gray-500">{(insight.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations" className="mt-4">
                <div className="space-y-4">
                  {selectedReport.recommendations?.map((rec: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            {rec.category === 'operational' && <Zap className="w-4 h-4 text-blue-600" />}
                            {rec.category === 'technical' && <Brain className="w-4 h-4 text-purple-600" />}
                            {rec.category === 'financial' && <DollarSign className="w-4 h-4 text-green-600" />}
                            {rec.category === 'strategic' && <Target className="w-4 h-4 text-orange-600" />}
                            {rec.title}
                          </h4>
                          <Badge variant={rec.priority === 'critical' ? 'destructive' : rec.priority === 'high' ? 'default' : 'secondary'}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-3">{rec.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Expected Impact:</span>
                            <p className="text-gray-600">{rec.expectedImpact}</p>
                          </div>
                          <div>
                            <span className="font-medium">Timeframe:</span>
                            <p className="text-gray-600">{rec.implementation.timeframe}</p>
                          </div>
                          <div>
                            <span className="font-medium">ROI:</span>
                            <p className="text-gray-600">{rec.roi.paybackPeriod}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="data" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Data Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Sensor readings ({selectedReport.metadata.context.timeframe})
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Performance metrics
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Industry benchmarks
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Financial data
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Analysis Quality</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Data Quality</span>
                            <span>{(selectedReport.metadata.dataQuality * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={selectedReport.metadata.dataQuality * 100} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Confidence Level</span>
                            <span>{(selectedReport.metadata.confidenceLevel * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={selectedReport.metadata.confidenceLevel * 100} />
                        </div>
                        <div className="text-sm text-gray-600">
                          Generated: {new Date(selectedReport.metadata.generatedAt).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Reports
          </CardTitle>
          <CardDescription>
            Previously generated intelligent reports for this facility
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Brain className="w-8 h-8 animate-pulse mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-2">No reports generated yet</p>
              <p className="text-sm text-gray-400">Generate your first intelligent report above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-center gap-3">
                    {getReportTypeIcon(report.reportType)}
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{report.audience}</span>
                        <span>•</span>
                        <span>{report.timeframe}</span>
                        <span>•</span>
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getConfidenceBadge(report.confidenceLevel)}
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}