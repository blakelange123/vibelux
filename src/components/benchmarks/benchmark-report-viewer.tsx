'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  DollarSign, 
  Leaf, 
  Award,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface BenchmarkReportViewerProps {
  reportId?: string;
  facilityId: string;
}

export function BenchmarkReportViewer({ reportId, facilityId }: BenchmarkReportViewerProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [reportId, facilityId]);

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/benchmarks/${reportId || 'latest'}?facilityId=${facilityId}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No benchmark report available</p>
            <p className="text-sm text-gray-500 mt-2">Submit market data to generate reports</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data } = reportData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Benchmark Report</h2>
          <p className="text-gray-600">{data.period} - {data.reportType}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Generated {new Date(reportData.generated).toLocaleDateString()}
        </Badge>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Yield Efficiency"
          value={`${data.facilityMetrics.yieldPerSqFt.toFixed(2)} lbs/sq ft`}
          comparison={data.industryAverages.yieldPerSqFt}
          icon={<Leaf className="h-5 w-5" />}
          ranking={data.rankings.yield}
        />
        <MetricCard
          title="Energy Usage"
          value={`${data.facilityMetrics.energyPerGram.toFixed(2)} kWh/g`}
          comparison={data.industryAverages.energyPerGram}
          icon={<Zap className="h-5 w-5" />}
          ranking={data.rankings.energy}
          inverse
        />
        <MetricCard
          title="Revenue Performance"
          value={`$${data.facilityMetrics.revenuePerSqFt.toFixed(0)}/sq ft`}
          comparison={data.industryAverages.revenuePerSqFt}
          icon={<DollarSign className="h-5 w-5" />}
          ranking={data.rankings.revenue}
        />
        <MetricCard
          title="Overall Ranking"
          value={`#${data.rankings.overall}`}
          icon={<Award className="h-5 w-5" />}
          isRanking
        />
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
              <CardDescription>How your facility compares to industry standards</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart 
                facilityMetrics={data.facilityMetrics}
                industryAverages={data.industryAverages}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Facilities achieving best-in-class results</CardDescription>
            </CardHeader>
            <CardContent>
              <TopPerformersTable performers={data.comparisons.topPerformers} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peer Group Comparison</CardTitle>
              <CardDescription>Similar facilities in your category</CardDescription>
            </CardHeader>
            <CardContent>
              <PeerComparisonChart peerGroup={data.comparisons.peerGroup} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>Data-driven observations about your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.insights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Actionable steps to improve performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Trends</CardTitle>
              <CardDescription>Your performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  comparison, 
  icon, 
  ranking,
  inverse = false,
  isRanking = false
}: any) {
  const percentDiff = comparison 
    ? ((parseFloat(value) - comparison) / comparison) * 100 
    : 0;
  
  const isPositive = inverse ? percentDiff < 0 : percentDiff > 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            {icon}
          </div>
          {ranking && !isRanking && (
            <Badge variant="secondary">#{ranking}</Badge>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {!isRanking && comparison && (
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(percentDiff).toFixed(1)}% {isPositive ? 'above' : 'below'} average
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PerformanceChart({ facilityMetrics, industryAverages }: any) {
  const data = {
    labels: ['Yield/SqFt', 'Energy Efficiency', 'Revenue/SqFt', 'Quality Score'],
    datasets: [
      {
        label: 'Your Facility',
        data: [
          facilityMetrics.yieldPerSqFt,
          1 / facilityMetrics.energyPerGram, // Inverse for efficiency
          facilityMetrics.revenuePerSqFt / 100, // Scale down
          facilityMetrics.qualityScore * 10,
        ],
        backgroundColor: 'rgba(124, 58, 237, 0.5)',
        borderColor: 'rgb(124, 58, 237)',
        borderWidth: 2,
      },
      {
        label: 'Industry Average',
        data: [
          industryAverages.yieldPerSqFt,
          1 / industryAverages.energyPerGram,
          industryAverages.revenuePerSqFt / 100,
          industryAverages.qualityScore * 10,
        ],
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
}

function TopPerformersTable({ performers }: any) {
  return (
    <div className="space-y-2">
      {performers.map((performer: any, index: number) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Badge variant="outline">{performer.overallRank}</Badge>
            <div>
              <p className="font-medium">{performer.facilityName}</p>
              <p className="text-sm text-gray-600">
                {performer.percentile}th percentile
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {performer.metrics.yieldPerSqFt.toFixed(2)} lbs/sq ft
            </p>
            <p className="text-xs text-gray-600">
              ${performer.metrics.revenuePerSqFt.toFixed(0)}/sq ft
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PeerComparisonChart({ peerGroup }: any) {
  const data = {
    labels: peerGroup.map((p: any) => p.facilityName),
    datasets: [
      {
        label: 'Yield Performance',
        data: peerGroup.map((p: any) => p.metrics.yieldPerSqFt),
        backgroundColor: 'rgba(124, 58, 237, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
}

function TrendChart() {
  // Mock data for trends - in real app, fetch historical data
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Yield per Sq Ft',
        data: [0.8, 0.85, 0.9, 0.88, 0.92, 0.95],
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Industry Average',
        data: [0.75, 0.76, 0.77, 0.78, 0.79, 0.8],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
}