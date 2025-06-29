'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Zap,
  Leaf,
  Target,
  ArrowUp,
  ArrowDown,
  Cannabis,
  Apple,
  Flower,
  FlaskConical,
  Package,
  Droplets,
  ThermometerSun,
  Scale,
  Timer,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { FacilityType, getFacilityFeatures } from '@/lib/facility-types';
import { CannabisMetricsService } from '@/lib/analytics/cannabis-metrics';
import { ProduceMetricsService } from '@/lib/analytics/produce-metrics';

interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.FC<any>;
  color: string;
  unit?: string;
}

interface IndustrySpecificDashboardProps {
  facilityId: string;
  facilityType: FacilityType;
  timeRange: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export function IndustrySpecificDashboard({ 
  facilityId, 
  facilityType, 
  timeRange 
}: IndustrySpecificDashboardProps) {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('');

  useEffect(() => {
    loadMetrics();
  }, [facilityId, facilityType, timeRange]);

  const loadMetrics = async () => {
    setIsLoading(true);
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'day':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      if (facilityType === FacilityType.CANNABIS) {
        const cannabisService = new CannabisMetricsService();
        const data = await cannabisService.calculateMetrics(facilityId, startDate, endDate);
        
        setMetrics([
          {
            id: 'gramsPerSqFt',
            title: 'Grams per Sq Ft',
            value: data.gramsPerSquareFoot.toFixed(1),
            icon: Cannabis,
            color: 'green',
            unit: 'g/ft²',
            trend: 'up',
            change: 5.2
          },
          {
            id: 'thc',
            title: 'Average THC',
            value: data.averageThc.toFixed(1),
            icon: FlaskConical,
            color: 'purple',
            unit: '%',
            trend: data.averageThc > 20 ? 'up' : 'down',
            change: 2.1
          },
          {
            id: 'costPerGram',
            title: 'Cost per Gram',
            value: `$${data.costPerGram.toFixed(2)}`,
            icon: DollarSign,
            color: 'green',
            unit: '',
            trend: data.costPerGram < 2 ? 'up' : 'down',
            change: -8.3
          },
          {
            id: 'compliance',
            title: 'Compliance Score',
            value: `${data.complianceScore}%`,
            icon: ShieldCheck,
            color: 'blue',
            unit: '',
            trend: data.complianceScore > 90 ? 'up' : 'down',
            change: 3.5
          }
        ]);
      } else if (facilityType === FacilityType.PRODUCE) {
        const produceService = new ProduceMetricsService();
        const data = await produceService.calculateMetrics(facilityId, startDate, endDate);
        
        setMetrics([
          {
            id: 'yieldPerM2',
            title: 'Yield per m²',
            value: data.yieldPerSquareMeter.toFixed(1),
            icon: Apple,
            color: 'green',
            unit: 'kg/m²',
            trend: 'up',
            change: 8.5
          },
          {
            id: 'daysToHarvest',
            title: 'Days to Harvest',
            value: Math.round(data.daysToHarvest),
            icon: Timer,
            color: 'blue',
            unit: 'days',
            trend: data.daysToHarvest < 30 ? 'up' : 'down',
            change: -3.2
          },
          {
            id: 'foodSafety',
            title: 'Food Safety Score',
            value: `${data.foodSafetyScore}%`,
            icon: ShieldCheck,
            color: 'green',
            unit: '',
            trend: data.foodSafetyScore > 95 ? 'up' : 'neutral',
            change: 2.0
          },
          {
            id: 'waterEfficiency',
            title: 'Water per kg',
            value: data.waterUsagePerKg.toFixed(0),
            icon: Droplets,
            color: 'blue',
            unit: 'L/kg',
            trend: data.waterUsagePerKg < 20 ? 'up' : 'down',
            change: -12.5
          }
        ]);
      }
      
      setSelectedMetric(metrics[0]?.id || '');
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIndustryInsights = () => {
    if (facilityType === FacilityType.CANNABIS) {
      return [
        {
          type: 'positive',
          icon: TrendingUp,
          title: 'THC Levels Optimal',
          description: 'Average THC content exceeds market requirements by 15%'
        },
        {
          type: 'warning',
          icon: Scale,
          title: 'Cost Optimization',
          description: 'Consider bulk nutrient purchasing to reduce cost per gram'
        },
        {
          type: 'info',
          icon: Package,
          title: 'Harvest Planning',
          description: '3 batches ready for harvest in the next 7 days'
        }
      ];
    } else if (facilityType === FacilityType.PRODUCE) {
      return [
        {
          type: 'positive',
          icon: TrendingUp,
          title: 'Yield Above Target',
          description: 'Current yield exceeds industry average by 22%'
        },
        {
          type: 'warning',
          icon: Droplets,
          title: 'Water Usage Alert',
          description: 'Zone 3 showing 15% higher water consumption than baseline'
        },
        {
          type: 'info',
          icon: Truck,
          title: 'Distribution Update',
          description: 'New wholesale buyer interested in weekly orders'
        }
      ];
    }
    return [];
  };

  const getFacilityIcon = () => {
    switch (facilityType) {
      case FacilityType.CANNABIS:
        return <Cannabis className="w-6 h-6 text-green-600" />;
      case FacilityType.PRODUCE:
        return <Apple className="w-6 h-6 text-red-600" />;
      case FacilityType.ORNAMENTAL:
        return <Flower className="w-6 h-6 text-pink-600" />;
      case FacilityType.RESEARCH:
        return <FlaskConical className="w-6 h-6 text-purple-600" />;
    }
  };

  const insights = getIndustryInsights();
  const facilityFeatures = getFacilityFeatures(facilityType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getFacilityIcon()}
          <div>
            <h2 className="text-2xl font-bold text-white">
              {facilityFeatures.displayName} Analytics
            </h2>
            <p className="text-gray-400 text-sm">{facilityFeatures.description}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(metric => (
          <div
            key={metric.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedMetric === metric.id 
                ? 'border-purple-600 bg-purple-900/20' 
                : 'border-gray-700 bg-gray-800'
            }`}
            onClick={() => setSelectedMetric(metric.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                metric.color === 'green' ? 'bg-green-900/30' :
                metric.color === 'yellow' ? 'bg-yellow-900/30' :
                metric.color === 'blue' ? 'bg-blue-900/30' :
                metric.color === 'purple' ? 'bg-purple-900/30' :
                'bg-gray-700'
              }`}>
                <metric.icon className={`w-5 h-5 ${
                  metric.color === 'green' ? 'text-green-500' :
                  metric.color === 'yellow' ? 'text-yellow-500' :
                  metric.color === 'blue' ? 'text-blue-500' :
                  metric.color === 'purple' ? 'text-purple-500' :
                  'text-gray-400'
                }`} />
              </div>
              {metric.trend && metric.change !== undefined && (
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-500' : 
                  metric.trend === 'down' ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : 
                   metric.trend === 'down' ? <ArrowDown className="w-4 h-4" /> : null}
                  {Math.abs(metric.change)}%
                </div>
              )}
            </div>
            <h3 className="text-sm text-gray-400 mb-1">{metric.title}</h3>
            <p className="text-2xl font-bold text-white">
              {metric.value}
              {metric.unit && <span className="text-sm font-normal text-gray-400"> {metric.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Industry-Specific Insights */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Industry Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-4 border rounded-lg ${
                insight.type === 'positive' ? 'border-green-600/30 bg-green-900/10' :
                insight.type === 'warning' ? 'border-yellow-600/30 bg-yellow-900/10' :
                'border-blue-600/30 bg-blue-900/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <insight.icon className={`w-5 h-5 mt-0.5 ${
                  insight.type === 'positive' ? 'text-green-500' :
                  insight.type === 'warning' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
                <div>
                  <h4 className="font-semibold mb-1 text-white">{insight.title}</h4>
                  <p className="text-sm text-gray-400">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance & Certifications */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          Compliance & Certifications
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {facilityType === FacilityType.CANNABIS ? (
            <>
              <div className="text-center">
                <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Track & Trace</p>
                <p className="text-xs text-gray-400">100% Compliant</p>
              </div>
              <div className="text-center">
                <FlaskConical className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Lab Testing</p>
                <p className="text-xs text-gray-400">All Batches Passed</p>
              </div>
              <div className="text-center">
                <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Packaging</p>
                <p className="text-xs text-gray-400">Child-Resistant</p>
              </div>
              <div className="text-center">
                <Target className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Security</p>
                <p className="text-xs text-gray-400">24/7 Monitoring</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">GAP Certified</p>
                <p className="text-xs text-gray-400">Valid until 2025</p>
              </div>
              <div className="text-center">
                <Leaf className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Organic</p>
                <p className="text-xs text-gray-400">USDA Certified</p>
              </div>
              <div className="text-center">
                <Apple className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Food Safety</p>
                <p className="text-xs text-gray-400">FSMA Compliant</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Traceability</p>
                <p className="text-xs text-gray-400">Lot Tracking</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}