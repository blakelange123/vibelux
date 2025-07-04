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
  FileText,
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Eye,
  Target,
  Map,
  BarChart2,
  Layers,
  Grid3x3,
  Compass,
  CloudSnow,
  Sun,
  Waves,
  TrendingDown,
  Maximize,
  Timer,
  Brain,
  Database,
  Workflow,
  RotateCw,
  Cpu
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
            yield: 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
            quality: 90 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8,
            efficiency: 88 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10
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
  },
  {
    id: 'cfd-airflow-analysis',
    name: 'CFD Airflow Analysis',
    description: 'Computational Fluid Dynamics analysis of airflow patterns, velocity vectors, and circulation efficiency',
    category: 'Climate',
    icon: Wind,
    widgets: [
      {
        type: 'metric',
        title: 'Average Air Velocity',
        dataSource: 'airflow',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 0.25,
            unit: 'm/s',
            change: 8.3,
            trend: 'up'
          },
          color: '#06b6d4'
        }
      },
      {
        type: 'metric',
        title: 'Circulation Efficiency',
        dataSource: 'airflow',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 87.4,
            unit: '%',
            change: 12.1,
            trend: 'up'
          },
          color: '#10b981'
        }
      },
      {
        type: 'metric',
        title: 'Dead Zone Area',
        dataSource: 'airflow',
        position: { x: 6, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 3.2,
            unit: '%',
            change: -15.6,
            trend: 'down'
          },
          color: '#ef4444'
        }
      },
      {
        type: 'metric',
        title: 'Turbulence Intensity',
        dataSource: 'airflow',
        position: { x: 9, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 8.7,
            unit: '%',
            change: -5.2,
            trend: 'down'
          },
          color: '#f59e0b'
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'Airflow Velocity Heatmap (Top View)',
        dataSource: 'airflow',
        position: { x: 0, y: 2, w: 6, h: 4 },
        config: {
          showColorbar: true,
          unit: 'm/s',
          data: 'velocity_heatmap',
          colorScale: ['#1e3a8a', '#3b82f6', '#06b6d4', '#10b981', '#fbbf24', '#ef4444']
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'Air Circulation Vectors',
        dataSource: 'airflow',
        position: { x: 6, y: 2, w: 6, h: 4 },
        config: {
          showGrid: true,
          arrowScale: 0.8,
          data: 'vector_field',
          overlayHeatmap: true
        }
      },
      {
        type: 'chart',
        chartType: 'line',
        title: 'Airflow Performance Over Time',
        dataSource: 'airflow',
        position: { x: 0, y: 6, w: 8, h: 3 },
        config: {
          showGrid: true,
          showLegend: true,
          data: [
            { time: '00:00', velocity: 0.22, efficiency: 84, deadZones: 4.1 },
            { time: '04:00', velocity: 0.24, efficiency: 86, deadZones: 3.8 },
            { time: '08:00', velocity: 0.26, efficiency: 88, deadZones: 3.5 },
            { time: '12:00', velocity: 0.25, efficiency: 87, deadZones: 3.2 },
            { time: '16:00', velocity: 0.23, efficiency: 85, deadZones: 3.6 },
            { time: '20:00', velocity: 0.24, efficiency: 87, deadZones: 3.4 }
          ]
        }
      },
      {
        type: 'table',
        title: 'Airflow Optimization Recommendations',
        dataSource: 'airflow',
        position: { x: 8, y: 6, w: 4, h: 3 },
        config: {
          data: [
            { recommendation: 'Adjust Fan 3 angle +15°', impact: 'High', zone: 'North-East' },
            { recommendation: 'Increase circulation fan speed 10%', impact: 'Medium', zone: 'Center' },
            { recommendation: 'Add deflector at rack row 4', impact: 'High', zone: 'South' },
            { recommendation: 'Relocate exhaust point', impact: 'Medium', zone: 'West' }
          ]
        }
      }
    ]
  },
  {
    id: 'climate-uniformity',
    name: 'Climate Uniformity Analysis',
    description: 'Multi-layer rack temperature and humidity uniformity with intra-layer analysis',
    category: 'Climate',
    icon: Layers,
    widgets: [
      {
        type: 'metric',
        title: 'Temperature Delta',
        dataSource: 'climate',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 1.8,
            unit: '°C',
            change: -12.5,
            trend: 'down'
          },
          color: '#ef4444'
        }
      },
      {
        type: 'metric',
        title: 'Humidity Delta',
        dataSource: 'climate',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 4.2,
            unit: '%RH',
            change: -8.7,
            trend: 'down'
          },
          color: '#06b6d4'
        }
      },
      {
        type: 'metric',
        title: 'VPD Uniformity',
        dataSource: 'climate',
        position: { x: 6, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 92.3,
            unit: '%',
            change: 5.4,
            trend: 'up'
          },
          color: '#10b981'
        }
      },
      {
        type: 'metric',
        title: 'Climate Stability Index',
        dataSource: 'climate',
        position: { x: 9, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 8.7,
            unit: '/10',
            change: 6.1,
            trend: 'up'
          },
          color: '#8b5cf6'
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'Temperature Distribution - Layer 1 (Top)',
        dataSource: 'climate',
        position: { x: 0, y: 2, w: 6, h: 3 },
        config: {
          showColorbar: true,
          unit: '°C',
          layer: 1,
          data: 'temperature_layer1',
          colorScale: ['#1e40af', '#3b82f6', '#10b981', '#fbbf24', '#ef4444']
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'Humidity Distribution - Layer 1 (Top)',
        dataSource: 'climate',
        position: { x: 6, y: 2, w: 6, h: 3 },
        config: {
          showColorbar: true,
          unit: '%RH',
          layer: 1,
          data: 'humidity_layer1',
          colorScale: ['#f3f4f6', '#e5e7eb', '#06b6d4', '#0891b2', '#0e7490']
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'Temperature Distribution - Layer 2 (Middle)',
        dataSource: 'climate',
        position: { x: 0, y: 5, w: 6, h: 3 },
        config: {
          showColorbar: true,
          unit: '°C',
          layer: 2,
          data: 'temperature_layer2',
          colorScale: ['#1e40af', '#3b82f6', '#10b981', '#fbbf24', '#ef4444']
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'Humidity Distribution - Layer 2 (Middle)',
        dataSource: 'climate',
        position: { x: 6, y: 5, w: 6, h: 3 },
        config: {
          showColorbar: true,
          unit: '%RH',
          layer: 2,
          data: 'humidity_layer2',
          colorScale: ['#f3f4f6', '#e5e7eb', '#06b6d4', '#0891b2', '#0e7490']
        }
      },
      {
        type: 'chart',
        chartType: 'line',
        title: 'Intra-Layer Climate Variation',
        dataSource: 'climate',
        position: { x: 0, y: 8, w: 8, h: 3 },
        config: {
          showGrid: true,
          showLegend: true,
          data: [
            { position: 'Front', layer1_temp: 24.2, layer2_temp: 24.8, layer1_rh: 65, layer2_rh: 67 },
            { position: 'Center', layer1_temp: 24.5, layer2_temp: 25.1, layer1_rh: 64, layer2_rh: 66 },
            { position: 'Back', layer1_temp: 24.8, layer2_temp: 25.4, layer1_rh: 63, layer2_rh: 65 }
          ]
        }
      },
      {
        type: 'table',
        title: 'Multi-Layer Performance Metrics',
        dataSource: 'climate',
        position: { x: 8, y: 8, w: 4, h: 3 },
        config: {
          data: [
            { metric: 'Layer 1 Temp Range', value: '23.8-25.2°C', target: '±1.5°C', status: 'above' },
            { metric: 'Layer 2 Temp Range', value: '24.1-25.6°C', target: '±1.5°C', status: 'above' },
            { metric: 'Inter-layer Δ Temperature', value: '0.6°C', target: '<1.0°C', status: 'below' },
            { metric: 'VPD Consistency', value: '92.3%', target: '>90%', status: 'above' }
          ]
        }
      }
    ]
  },
  {
    id: 'environmental-optimization',
    name: 'Environmental Optimization Report',
    description: 'Advanced climate control analysis with predictive modeling and optimization recommendations',
    category: 'Climate',
    icon: Target,
    widgets: [
      {
        type: 'metric',
        title: 'VPD Optimization Score',
        dataSource: 'optimization',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 94.7,
            unit: '%',
            change: 7.2,
            trend: 'up'
          },
          color: '#10b981'
        }
      },
      {
        type: 'metric',
        title: 'Energy Efficiency',
        dataSource: 'optimization',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 88.3,
            unit: '%',
            change: 4.1,
            trend: 'up'
          },
          color: '#3b82f6'
        }
      },
      {
        type: 'metric',
        title: 'Climate Stability',
        dataSource: 'optimization',
        position: { x: 6, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 96.1,
            unit: '%',
            change: 2.8,
            trend: 'up'
          },
          color: '#8b5cf6'
        }
      },
      {
        type: 'metric',
        title: 'Optimization Potential',
        dataSource: 'optimization',
        position: { x: 9, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 12.4,
            unit: '%',
            change: -3.2,
            trend: 'down'
          },
          color: '#f59e0b'
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'VPD Optimization Timeline',
        dataSource: 'optimization',
        position: { x: 0, y: 2, w: 8, h: 4 },
        config: {
          showGrid: true,
          showLegend: true,
          data: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            current_vpd: 1.2 + Math.sin(i * 0.5) * 0.3,
            optimal_vpd: 1.0 + Math.sin(i * 0.4) * 0.2,
            predicted_vpd: 1.1 + Math.sin(i * 0.45) * 0.25
          }))
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'Environmental Performance Radar',
        dataSource: 'optimization',
        position: { x: 8, y: 2, w: 4, h: 4 },
        config: {
          data: [
            { metric: 'Temperature Control', current: 92, optimal: 95 },
            { metric: 'Humidity Control', current: 88, optimal: 93 },
            { metric: 'Air Circulation', current: 85, optimal: 90 },
            { metric: 'Energy Efficiency', current: 88, optimal: 92 },
            { metric: 'VPD Consistency', current: 94, optimal: 96 },
            { metric: 'CO₂ Distribution', current: 91, optimal: 94 }
          ]
        }
      },
      {
        type: 'table',
        title: 'AI-Powered Optimization Recommendations',
        dataSource: 'optimization',
        position: { x: 0, y: 6, w: 12, h: 3 },
        config: {
          data: [
            { 
              recommendation: 'Increase exhaust fan speed by 15% during peak light hours',
              impact: 'Reduce temperature variance by 0.8°C',
              energy_change: '+2.1 kWh/day',
              roi: '18 days',
              priority: 'High'
            },
            {
              recommendation: 'Implement dynamic humidity setpoints based on growth stage',
              impact: 'Improve VPD consistency by 12%',
              energy_change: '-1.8 kWh/day',
              roi: '12 days',
              priority: 'High'
            },
            {
              recommendation: 'Optimize circulation fan timing with light cycles',
              impact: 'Enhance air mixing by 25%',
              energy_change: '-0.5 kWh/day',
              roi: '8 days',
              priority: 'Medium'
            },
            {
              recommendation: 'Adjust CO₂ injection pattern for better distribution',
              impact: 'Increase CO₂ utilization by 18%',
              energy_change: '+0.3 kWh/day',
              roi: '22 days',
              priority: 'Medium'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'predictive-facility-analytics',
    name: 'Predictive Facility Analytics',
    description: 'Machine learning-powered predictions for equipment failure, yield forecasting, and maintenance scheduling',
    category: 'Analytics',
    icon: Brain,
    widgets: [
      {
        type: 'metric',
        title: 'Prediction Accuracy',
        dataSource: 'predictive',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 94.2,
            unit: '%',
            change: 1.8,
            trend: 'up'
          },
          color: '#10b981'
        }
      },
      {
        type: 'metric',
        title: 'Equipment Health Score',
        dataSource: 'predictive',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 87.6,
            unit: '/100',
            change: -2.1,
            trend: 'down'
          },
          color: '#f59e0b'
        }
      },
      {
        type: 'metric',
        title: 'Yield Forecast Accuracy',
        dataSource: 'predictive',
        position: { x: 6, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 91.8,
            unit: '%',
            change: 3.4,
            trend: 'up'
          },
          color: '#8b5cf6'
        }
      },
      {
        type: 'metric',
        title: 'Maintenance Alerts',
        dataSource: 'predictive',
        position: { x: 9, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 3,
            unit: 'active',
            change: -40,
            trend: 'down'
          },
          color: '#ef4444'
        }
      },
      {
        type: 'chart',
        chartType: 'line',
        title: 'Equipment Health Trends',
        dataSource: 'predictive',
        position: { x: 0, y: 2, w: 8, h: 4 },
        config: {
          showGrid: true,
          showLegend: true,
          data: Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            hvac_health: 95 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
            lighting_health: 92 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8,
            irrigation_health: 88 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 12,
            overall_health: 90 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8
          }))
        }
      },
      {
        type: 'table',
        title: 'Predictive Maintenance Schedule',
        dataSource: 'predictive',
        position: { x: 8, y: 2, w: 4, h: 4 },
        config: {
          data: [
            { equipment: 'HVAC Unit 2', type: 'Filter Replacement', days_until: 7, confidence: '94%' },
            { equipment: 'LED Driver Row 3', type: 'Capacitor Check', days_until: 12, confidence: '89%' },
            { equipment: 'Irrigation Pump 1', type: 'Seal Inspection', days_until: 18, confidence: '91%' },
            { equipment: 'Exhaust Fan 4', type: 'Bearing Service', days_until: 25, confidence: '87%' }
          ]
        }
      },
      {
        type: 'chart',
        chartType: 'bar',
        title: 'Yield Prediction vs Actual (Last 6 Harvests)',
        dataSource: 'predictive',
        position: { x: 0, y: 6, w: 6, h: 3 },
        config: {
          showGrid: true,
          showLegend: true,
          data: [
            { harvest: 'H1', predicted: 125, actual: 128 },
            { harvest: 'H2', predicted: 132, actual: 129 },
            { harvest: 'H3', predicted: 138, actual: 141 },
            { harvest: 'H4', predicted: 145, actual: 142 },
            { harvest: 'H5', predicted: 140, actual: 144 },
            { harvest: 'H6', predicted: 148, actual: 146 }
          ]
        }
      },
      {
        type: 'chart',
        chartType: 'pie',
        title: 'Overall Facility Health',
        dataSource: 'predictive',
        position: { x: 6, y: 6, w: 3, h: 3 },
        config: {
          value: 87.6,
          min: 0,
          max: 100,
          thresholds: [60, 80, 95],
          colors: ['#ef4444', '#f59e0b', '#10b981']
        }
      },
      {
        type: 'metric',
        title: 'Next Harvest Prediction',
        dataSource: 'predictive',
        position: { x: 9, y: 6, w: 3, h: 3 },
        config: {
          metric: {
            value: 152,
            unit: 'kg',
            confidence: 91.8
          },
          color: '#10b981',
          subtitle: '12 days remaining'
        }
      }
    ]
  },
  {
    id: 'multi-room-comparison',
    name: 'Multi-Room Performance Comparison',
    description: 'Comparative analysis across multiple grow rooms with environmental and yield benchmarking',
    category: 'Analytics',
    icon: BarChart2,
    widgets: [
      {
        type: 'metric',
        title: 'Active Grow Rooms',
        dataSource: 'rooms',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 8,
            unit: 'rooms',
            change: 0,
            trend: 'stable'
          },
          color: '#3b82f6'
        }
      },
      {
        type: 'metric',
        title: 'Best Performing Room',
        dataSource: 'rooms',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 'Room 3',
            subtitle: '2.94 kg/m²',
            change: 8.2,
            trend: 'up'
          },
          color: '#10b981'
        }
      },
      {
        type: 'metric',
        title: 'Yield Variance',
        dataSource: 'rooms',
        position: { x: 6, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 12.8,
            unit: '%',
            change: -5.4,
            trend: 'down'
          },
          color: '#f59e0b'
        }
      },
      {
        type: 'metric',
        title: 'Overall Efficiency',
        dataSource: 'rooms',
        position: { x: 9, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 89.4,
            unit: '%',
            change: 3.7,
            trend: 'up'
          },
          color: '#8b5cf6'
        }
      },
      {
        type: 'table',
        title: 'Room Performance Comparison',
        dataSource: 'rooms',
        position: { x: 0, y: 2, w: 12, h: 4 },
        config: {
          data: [
            { room: 'Room 1', yield: '2.67 kg/m²', energy: '32.1 kWh/kg', temp_delta: '1.2°C', rh_delta: '3.8%', efficiency: '87%', status: 'good' },
            { room: 'Room 2', yield: '2.82 kg/m²', energy: '29.8 kWh/kg', temp_delta: '0.9°C', rh_delta: '2.4%', efficiency: '91%', status: 'excellent' },
            { room: 'Room 3', yield: '2.94 kg/m²', energy: '28.5 kWh/kg', temp_delta: '0.7°C', rh_delta: '2.1%', efficiency: '94%', status: 'excellent' },
            { room: 'Room 4', yield: '2.59 kg/m²', energy: '33.4 kWh/kg', temp_delta: '1.8°C', rh_delta: '4.2%', efficiency: '83%', status: 'needs_attention' },
            { room: 'Room 5', yield: '2.75 kg/m²', energy: '30.2 kWh/kg', temp_delta: '1.1°C', rh_delta: '3.1%', efficiency: '89%', status: 'good' },
            { room: 'Room 6', yield: '2.71 kg/m²', energy: '31.5 kWh/kg', temp_delta: '1.4°C', rh_delta: '3.6%', efficiency: '86%', status: 'good' },
            { room: 'Room 7', yield: '2.88 kg/m²', energy: '29.1 kWh/kg', temp_delta: '0.8°C', rh_delta: '2.8%', efficiency: '92%', status: 'excellent' },
            { room: 'Room 8', yield: '2.64 kg/m²', energy: '32.8 kWh/kg', temp_delta: '1.6°C', rh_delta: '4.0%', efficiency: '84%', status: 'needs_attention' }
          ]
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'Yield vs Energy Efficiency Correlation',
        dataSource: 'rooms',
        position: { x: 0, y: 6, w: 6, h: 3 },
        config: {
          xAxis: 'Energy (kWh/kg)',
          yAxis: 'Yield (kg/m²)',
          showTrendline: true,
          data: [
            { x: 32.1, y: 2.67, room: 'Room 1' },
            { x: 29.8, y: 2.82, room: 'Room 2' },
            { x: 28.5, y: 2.94, room: 'Room 3' },
            { x: 33.4, y: 2.59, room: 'Room 4' },
            { x: 30.2, y: 2.75, room: 'Room 5' },
            { x: 31.5, y: 2.71, room: 'Room 6' },
            { x: 29.1, y: 2.88, room: 'Room 7' },
            { x: 32.8, y: 2.64, room: 'Room 8' }
          ]
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'Top 3 Rooms Performance Radar',
        dataSource: 'rooms',
        position: { x: 6, y: 6, w: 6, h: 3 },
        config: {
          data: [
            { room: 'Room 3', yield: 94, energy: 92, climate: 96, quality: 93 },
            { room: 'Room 7', yield: 91, energy: 89, climate: 94, quality: 90 },
            { room: 'Room 2', yield: 88, energy: 87, climate: 91, quality: 89 }
          ]
        }
      }
    ]
  },
  {
    id: 'advanced-lighting-analysis',
    name: 'Advanced Lighting Analysis',
    description: 'Comprehensive PPFD distribution, spectrum analysis, and photon efficiency optimization',
    category: 'Lighting',
    icon: Sun,
    widgets: [
      {
        type: 'metric',
        title: 'Average PPFD',
        dataSource: 'lighting',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 847,
            unit: 'μmol/m²/s',
            change: 5.2,
            trend: 'up'
          },
          color: '#fbbf24'
        }
      },
      {
        type: 'metric',
        title: 'PPFD Uniformity',
        dataSource: 'lighting',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 91.4,
            unit: '%',
            change: 2.8,
            trend: 'up'
          },
          color: '#10b981'
        }
      },
      {
        type: 'metric',
        title: 'Photon Efficacy',
        dataSource: 'lighting',
        position: { x: 6, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 2.74,
            unit: 'μmol/J',
            change: 8.1,
            trend: 'up'
          },
          color: '#8b5cf6'
        }
      },
      {
        type: 'metric',
        title: 'DLI Target Achievement',
        dataSource: 'lighting',
        position: { x: 9, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 96.8,
            unit: '%',
            change: 4.2,
            trend: 'up'
          },
          color: '#06b6d4'
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'PPFD Distribution Heatmap',
        dataSource: 'lighting',
        position: { x: 0, y: 2, w: 8, h: 4 },
        config: {
          showColorbar: true,
          unit: 'μmol/m²/s',
          data: 'ppfd_heatmap',
          colorScale: ['#1e40af', '#3b82f6', '#fbbf24', '#f59e0b', '#dc2626']
        }
      },
      {
        type: 'chart',
        chartType: 'line',
        title: 'Spectrum Analysis',
        dataSource: 'lighting',
        position: { x: 8, y: 2, w: 4, h: 4 },
        config: {
          showGrid: true,
          xAxis: 'Wavelength (nm)',
          yAxis: 'Relative Intensity',
          data: [
            { wavelength: 400, intensity: 0.1 },
            { wavelength: 420, intensity: 0.3 },
            { wavelength: 440, intensity: 0.8 },
            { wavelength: 460, intensity: 1.0 },
            { wavelength: 480, intensity: 0.6 },
            { wavelength: 500, intensity: 0.4 },
            { wavelength: 520, intensity: 0.5 },
            { wavelength: 540, intensity: 0.3 },
            { wavelength: 560, intensity: 0.2 },
            { wavelength: 580, intensity: 0.3 },
            { wavelength: 600, intensity: 0.6 },
            { wavelength: 620, intensity: 0.9 },
            { wavelength: 640, intensity: 1.2 },
            { wavelength: 660, intensity: 1.5 },
            { wavelength: 680, intensity: 1.0 },
            { wavelength: 700, intensity: 0.8 },
            { wavelength: 720, intensity: 0.4 },
            { wavelength: 740, intensity: 0.2 },
            { wavelength: 760, intensity: 0.1 },
            { wavelength: 780, intensity: 0.05 }
          ]
        }
      },
      {
        type: 'chart',
        chartType: 'bar',
        title: 'Daily Light Integral (DLI) Achievement',
        dataSource: 'lighting',
        position: { x: 0, y: 6, w: 6, h: 3 },
        config: {
          showGrid: true,
          showLegend: true,
          data: [
            { zone: 'Zone A', target: 45, actual: 43.8, efficiency: 97.3 },
            { zone: 'Zone B', target: 45, actual: 44.2, efficiency: 98.2 },
            { zone: 'Zone C', target: 45, actual: 42.9, efficiency: 95.3 },
            { zone: 'Zone D', target: 45, actual: 44.7, efficiency: 99.3 },
            { zone: 'Zone E', target: 45, actual: 43.5, efficiency: 96.7 },
            { zone: 'Zone F', target: 45, actual: 44.1, efficiency: 98.0 }
          ]
        }
      },
      {
        type: 'table',
        title: 'Lighting Optimization Opportunities',
        dataSource: 'lighting',
        position: { x: 6, y: 6, w: 6, h: 3 },
        config: {
          data: [
            { zone: 'Zone C', issue: 'Low PPFD corners', recommendation: 'Add supplemental LEDs', impact: '+8% uniformity' },
            { zone: 'Zone A', issue: 'Spectrum imbalance', recommendation: 'Adjust red:blue ratio', impact: '+3% efficacy' },
            { zone: 'Zone F', issue: 'Height optimization', recommendation: 'Lower fixtures 15cm', impact: '+12% intensity' },
            { zone: 'Zone B', issue: 'Heat management', recommendation: 'Improve ventilation', impact: '+5% efficiency' }
          ]
        }
      }
    ]
  },
  {
    id: 'water-nutrient-analysis',
    name: 'Water & Nutrient Analysis',
    description: 'Comprehensive irrigation efficiency, nutrient distribution, and water quality monitoring',
    category: 'Irrigation',
    icon: Droplets,
    widgets: [
      {
        type: 'metric',
        title: 'Water Use Efficiency',
        dataSource: 'irrigation',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 2.8,
            unit: 'L/kg',
            change: -12.5,
            trend: 'down'
          },
          color: '#06b6d4'
        }
      },
      {
        type: 'metric',
        title: 'Nutrient Efficiency',
        dataSource: 'irrigation',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 87.3,
            unit: '%',
            change: 5.7,
            trend: 'up'
          },
          color: '#10b981'
        }
      },
      {
        type: 'metric',
        title: 'pH Stability',
        dataSource: 'irrigation',
        position: { x: 6, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 94.2,
            unit: '%',
            change: 2.1,
            trend: 'up'
          },
          color: '#8b5cf6'
        }
      },
      {
        type: 'metric',
        title: 'Runoff Recovery',
        dataSource: 'irrigation',
        position: { x: 9, y: 0, w: 3, h: 2 },
        config: {
          metric: {
            value: 78.6,
            unit: '%',
            change: 8.9,
            trend: 'up'
          },
          color: '#f59e0b'
        }
      },
      {
        type: 'chart',
        chartType: 'line',
        title: 'Daily Water Consumption vs Yield Correlation',
        dataSource: 'irrigation',
        position: { x: 0, y: 2, w: 8, h: 4 },
        config: {
          showGrid: true,
          showLegend: true,
          data: Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            water_consumption: 180 + Math.sin(i * 0.2) * 20,
            yield_prediction: 2.6 + Math.sin(i * 0.18) * 0.3,
            efficiency_score: 85 + Math.sin(i * 0.15) * 10
          }))
        }
      },
      {
        type: 'chart',
        chartType: 'pie',
        title: 'Overall Irrigation Score',
        dataSource: 'irrigation',
        position: { x: 8, y: 2, w: 4, h: 4 },
        config: {
          value: 87.3,
          min: 0,
          max: 100,
          thresholds: [60, 80, 95],
          colors: ['#ef4444', '#f59e0b', '#10b981']
        }
      },
      {
        type: 'table',
        title: 'Nutrient Balance Analysis',
        dataSource: 'irrigation',
        position: { x: 0, y: 6, w: 6, h: 3 },
        config: {
          data: [
            { nutrient: 'Nitrogen (N)', target: '150 ppm', actual: '148 ppm', variance: '-1.3%', status: 'optimal' },
            { nutrient: 'Phosphorus (P)', target: '50 ppm', actual: '52 ppm', variance: '+4.0%', status: 'acceptable' },
            { nutrient: 'Potassium (K)', target: '200 ppm', actual: '195 ppm', variance: '-2.5%', status: 'optimal' },
            { nutrient: 'Calcium (Ca)', target: '80 ppm', actual: '78 ppm', variance: '-2.5%', status: 'optimal' },
            { nutrient: 'Magnesium (Mg)', target: '40 ppm', actual: '43 ppm', variance: '+7.5%', status: 'high' },
            { nutrient: 'Iron (Fe)', target: '2.5 ppm', actual: '2.3 ppm', variance: '-8.0%', status: 'low' }
          ]
        }
      },
      {
        type: 'chart',
        chartType: 'area',
        title: 'pH and EC Trends (24h)',
        dataSource: 'irrigation',
        position: { x: 6, y: 6, w: 6, h: 3 },
        config: {
          showGrid: true,
          showLegend: true,
          data: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            ph: 5.8 + Math.sin(i * 0.3) * 0.2,
            ec: 1.8 + Math.sin(i * 0.25) * 0.15,
            target_ph: 5.8,
            target_ec: 1.8
          }))
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
  { id: 'Climate', name: 'Climate', count: reportTemplates.filter(t => t.category === 'Climate').length },
  { id: 'Analytics', name: 'Analytics', count: reportTemplates.filter(t => t.category === 'Analytics').length },
  { id: 'Lighting', name: 'Lighting', count: reportTemplates.filter(t => t.category === 'Lighting').length },
  { id: 'Irrigation', name: 'Irrigation', count: reportTemplates.filter(t => t.category === 'Irrigation').length },
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