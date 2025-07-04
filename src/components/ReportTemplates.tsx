"use client"

import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Zap, 
  Leaf, 
  DollarSign,
  Activity,
  Calendar,
  CheckCircle,
  AlertCircle,
  Users,
  Settings,
  FileText
} from 'lucide-react'

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: React.FC<any>
  widgets: Array<{
    type: 'chart' | 'table' | 'metric' | 'text' | 'image'
    chartType?: 'line' | 'bar' | 'pie' | 'area'
    title: string
    dataSource: string
    position: { x: number; y: number; w: number; h: number }
    config: any
  }>
}

export const reportTemplates: ReportTemplate[] = [
  {
    id: 'energy-efficiency',
    name: 'Energy Efficiency Dashboard',
    description: 'Monitor power consumption, costs, and efficiency metrics',
    category: 'Energy',
    icon: Zap,
    widgets: [
      {
        type: 'metric',
        title: 'Total Energy Cost',
        dataSource: 'energy',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 12450,
            unit: 'USD',
            change: -5.2,
            trend: 'down'
          },
          color: '#10b981'
        }
      },
      {
        type: 'metric',
        title: 'Power Usage Effectiveness',
        dataSource: 'energy',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 1.42,
            unit: 'PUE',
            change: -3.1,
            trend: 'down'
          },
          color: '#3b82f6'
        }
      },
      {
        type: 'metric',
        title: 'kWh per kg Yield',
        dataSource: 'energy',
        position: { x: 6, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 28.5,
            unit: 'kWh/kg',
            change: -8.7,
            trend: 'down'
          },
          color: '#8b5cf6'
        }
      },
      {
        type: 'metric',
        title: 'Peak Demand',
        dataSource: 'energy',
        position: { x: 9, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 245,
            unit: 'kW',
            change: 2.1,
            trend: 'up'
          },
          color: '#ef4444'
        }
      },
      {
        type: 'chart',
        chartType: 'line',
        title: 'Daily Energy Consumption',
        dataSource: 'energy',
        position: { x: 0, y: 2, w: 8, h: 4 },
        config: {
          showGrid: true,
          showLegend: true,
          color: '#6366f1',
          data: [
            { name: 'Mon', lighting: 180, hvac: 120, other: 80 },
            { name: 'Tue', lighting: 175, hvac: 125, other: 82 },
            { name: 'Wed', lighting: 185, hvac: 118, other: 85 },
            { name: 'Thu', lighting: 178, hvac: 122, other: 81 },
            { name: 'Fri', lighting: 182, hvac: 119, other: 83 },
            { name: 'Sat', lighting: 170, hvac: 115, other: 78 },
            { name: 'Sun', lighting: 165, hvac: 110, other: 75 }
          ]
        }
      },
      {
        type: 'chart',
        chartType: 'pie',
        title: 'Energy Distribution',
        dataSource: 'energy',
        position: { x: 8, y: 2, w: 4, h: 4 },
        config: {
          showLegend: true,
          data: [
            { name: 'Lighting', value: 45, color: '#8b5cf6' },
            { name: 'HVAC', value: 30, color: '#3b82f6' },
            { name: 'Pumps', value: 15, color: '#10b981' },
            { name: 'Other', value: 10, color: '#f59e0b' }
          ]
        }
      }
    ]
  },
  {
    id: 'yield-analysis',
    name: 'Yield Performance Report',
    description: 'Track crop yields, quality metrics, and harvest predictions',
    category: 'Production',
    icon: Leaf,
    widgets: [
      {
        type: 'metric',
        title: 'Current Yield',
        dataSource: 'production',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 2.85,
            unit: 'kg/m²',
            change: 12.5,
            trend: 'up'
          },
          color: '#10b981'
        }
      },
      {
        type: 'metric',
        title: 'Quality Score',
        dataSource: 'production',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 94.2,
            unit: '%',
            change: 2.8,
            trend: 'up'
          },
          color: '#3b82f6'
        }
      },
      {
        type: 'chart',
        chartType: 'bar',
        title: 'Weekly Harvest Comparison',
        dataSource: 'production',
        position: { x: 0, y: 2, w: 6, h: 4 },
        config: {
          showGrid: true,
          showLegend: true,
          color: '#10b981',
          data: [
            { name: 'Week 1', actual: 120, predicted: 115 },
            { name: 'Week 2', actual: 132, predicted: 128 },
            { name: 'Week 3', actual: 141, predicted: 135 },
            { name: 'Week 4', actual: 138, predicted: 140 }
          ]
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'Cumulative Yield Trend',
        dataSource: 'production',
        position: { x: 6, y: 2, w: 6, h: 4 },
        config: {
          showGrid: true,
          color: '#8b5cf6',
          data: [
            { name: 'Jan', yield: 450 },
            { name: 'Feb', yield: 890 },
            { name: 'Mar', yield: 1380 },
            { name: 'Apr', yield: 1920 },
            { name: 'May', yield: 2450 },
            { name: 'Jun', yield: 3020 }
          ]
        }
      }
    ]
  },
  {
    id: 'financial-overview',
    name: 'Financial Performance Summary',
    description: 'Revenue, costs, ROI, and financial projections',
    category: 'Financial',
    icon: DollarSign,
    widgets: [
      {
        type: 'metric',
        title: 'Monthly Revenue',
        dataSource: 'financial',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 84500,
            unit: 'USD',
            change: 18.2,
            trend: 'up'
          },
          color: '#10b981'
        }
      },
      {
        type: 'metric',
        title: 'Operating Costs',
        dataSource: 'financial',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 52300,
            unit: 'USD',
            change: 5.1,
            trend: 'up'
          },
          color: '#ef4444'
        }
      },
      {
        type: 'metric',
        title: 'Net Profit Margin',
        dataSource: 'financial',
        position: { x: 6, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 38.1,
            unit: '%',
            change: 4.5,
            trend: 'up'
          },
          color: '#3b82f6'
        }
      },
      {
        type: 'metric',
        title: 'ROI',
        dataSource: 'financial',
        position: { x: 9, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 142,
            unit: '%',
            change: 22.3,
            trend: 'up'
          },
          color: '#8b5cf6'
        }
      },
      {
        type: 'chart',
        chartType: 'line',
        title: 'Revenue vs Costs Trend',
        dataSource: 'financial',
        position: { x: 0, y: 2, w: 12, h: 4 },
        config: {
          showGrid: true,
          showLegend: true,
          data: [
            { name: 'Jan', revenue: 72000, costs: 48000, profit: 24000 },
            { name: 'Feb', revenue: 75000, costs: 49000, profit: 26000 },
            { name: 'Mar', revenue: 78000, costs: 50000, profit: 28000 },
            { name: 'Apr', revenue: 82000, costs: 51000, profit: 31000 },
            { name: 'May', revenue: 80000, costs: 51500, profit: 28500 },
            { name: 'Jun', revenue: 84500, costs: 52300, profit: 32200 }
          ]
        }
      }
    ]
  },
  {
    id: 'operations-monthly',
    name: 'Monthly Operations Summary',
    description: 'Comprehensive overview of all operational metrics',
    category: 'Operations',
    icon: Activity,
    widgets: [
      {
        type: 'text',
        title: 'Executive Summary',
        dataSource: 'none',
        position: { x: 0, y: 0, w: 12, h: 2 },
        config: {
          text: 'This monthly operations report provides a comprehensive overview of facility performance, including energy efficiency improvements, yield optimization results, and financial performance. Key highlights include a 12.5% increase in yield efficiency and 18.2% revenue growth compared to the previous month.'
        }
      },
      {
        type: 'metric',
        title: 'Overall Efficiency',
        dataSource: 'operations',
        position: { x: 0, y: 2, w: 3, h: 2 },
        config: {
          metric: {
            value: 91.5,
            unit: '%',
            change: 3.2,
            trend: 'up'
          },
          color: '#10b981'
        }
      },
      {
        type: 'metric',
        title: 'Active Grow Rooms',
        dataSource: 'operations',
        position: { x: 3, y: 2, w: 3, h: 2 },
        config: {
          metric: {
            value: 24,
            unit: 'rooms',
            change: 0,
            trend: 'stable'
          },
          color: '#3b82f6'
        }
      },
      {
        type: 'chart',
        chartType: 'line',
        title: 'Daily Production Metrics',
        dataSource: 'operations',
        position: { x: 0, y: 4, w: 6, h: 4 },
        config: {
          showGrid: true,
          showLegend: true,
          data: Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            yield: 85 + Math.random() * 15,
            quality: 90 + Math.random() * 8,
            efficiency: 88 + Math.random() * 10
          }))
        }
      },
      {
        type: 'table',
        title: 'Key Performance Indicators',
        dataSource: 'operations',
        position: { x: 6, y: 4, w: 6, h: 4 },
        config: {
          data: [
            { metric: 'Yield per sqft', value: '0.52 kg', target: '0.50 kg', status: 'above' },
            { metric: 'Energy per kg', value: '28.5 kWh', target: '30 kWh', status: 'below' },
            { metric: 'Water usage', value: '2.1 L/kg', target: '2.5 L/kg', status: 'below' },
            { metric: 'Labor hours', value: '0.8 hr/kg', target: '1.0 hr/kg', status: 'below' },
            { metric: 'Quality rate', value: '94.2%', target: '92%', status: 'above' }
          ]
        }
      }
    ]
  }
]

export const getTemplateById = (id: string): ReportTemplate | undefined => {
  return reportTemplates.find(template => template.id === id)
}

export const getTemplatesByCategory = (category: string): ReportTemplate[] => {
  return reportTemplates.filter(template => template.category === category)
}

export const reportCategories = [
  { id: 'all', name: 'All Reports', count: reportTemplates.length },
  { id: 'Energy', name: 'Energy', count: reportTemplates.filter(t => t.category === 'Energy').length },
  { id: 'Production', name: 'Production', count: reportTemplates.filter(t => t.category === 'Production').length },
  { id: 'Financial', name: 'Financial', count: reportTemplates.filter(t => t.category === 'Financial').length },
  { id: 'Operations', name: 'Operations', count: reportTemplates.filter(t => t.category === 'Operations').length }
]

export function ReportTemplates({ onSelectTemplate }: { onSelectTemplate: (template: ReportTemplate) => void }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Create a New Report
      </h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTemplates.map(template => {
          const Icon = template.icon
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="text-left p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-sm text-gray-400">{template.category}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-400">
                {template.description}
              </p>
              <div className="mt-4 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Click to use this template
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}