import { DashboardWidget } from '@/components/dashboard/DashboardBuilder';

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'environment' | 'operations' | 'analytics' | 'custom';
  widgets: Omit<DashboardWidget, 'id'>[];
  layouts: {
    lg: Array<{ i: string; x: number; y: number; w: number; h: number }>;
  };
}

export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'env-monitoring',
    name: 'Environmental Monitoring',
    description: 'Real-time environmental conditions monitoring',
    category: 'environment',
    widgets: [
      {
        type: 'gauge',
        title: 'Temperature',
        dataBindings: [{
          source: 'sensor',
          path: 'zone1/temperature',
          refreshRate: 2000
        }],
        config: {
          min: 50,
          max: 90,
          unit: '°F',
          thresholds: [
            { value: 70, color: '#10b981' },
            { value: 75, color: '#f59e0b' },
            { value: 80, color: '#ef4444' }
          ]
        }
      },
      {
        type: 'gauge',
        title: 'Humidity',
        dataBindings: [{
          source: 'sensor',
          path: 'zone1/humidity',
          refreshRate: 2000
        }],
        config: {
          min: 0,
          max: 100,
          unit: '%',
          thresholds: [
            { value: 60, color: '#10b981' },
            { value: 70, color: '#f59e0b' },
            { value: 80, color: '#ef4444' }
          ]
        }
      },
      {
        type: 'trend',
        title: 'Temperature Trend',
        dataBindings: [{
          source: 'database',
          path: 'sensors.history.temperature',
          refreshRate: 5000
        }],
        config: {
          timeRange: '24h',
          showGrid: true,
          lines: [{
            dataKey: 'value',
            color: '#8b5cf6',
            name: 'Temperature'
          }]
        }
      },
      {
        type: 'heatmap',
        title: 'PPFD Distribution',
        dataBindings: [{
          source: 'calculation',
          path: 'ppfd.grid',
          refreshRate: 10000
        }],
        config: {
          rows: 10,
          cols: 10,
          colorScale: 'viridis',
          min: 0,
          max: 1000,
          showValues: false,
          unit: 'μmol/m²/s'
        }
      },
      {
        type: 'alarm',
        title: 'System Alarms',
        dataBindings: [{
          source: 'websocket',
          path: 'alarms/active',
          refreshRate: 1000
        }],
        config: {
          maxAlarms: 5,
          showAcknowledged: false,
          severityFilter: ['critical', 'warning'],
          sortOrder: 'newest'
        }
      }
    ],
    layouts: {
      lg: [
        { i: 'widget-0', x: 0, y: 0, w: 3, h: 4 },
        { i: 'widget-1', x: 3, y: 0, w: 3, h: 4 },
        { i: 'widget-2', x: 6, y: 0, w: 6, h: 4 },
        { i: 'widget-3', x: 0, y: 4, w: 8, h: 6 },
        { i: 'widget-4', x: 8, y: 4, w: 4, h: 6 }
      ]
    }
  },
  {
    id: 'control-panel',
    name: 'Control Panel',
    description: 'Equipment control and status monitoring',
    category: 'operations',
    widgets: [
      {
        type: 'status',
        title: 'System Status',
        dataBindings: [{
          source: 'modbus',
          path: 'coil:1:0',
          refreshRate: 1000
        }],
        config: {
          states: [
            { value: 0, label: 'Offline', color: '#ef4444', icon: 'x' },
            { value: 1, label: 'Online', color: '#10b981', icon: 'check' },
            { value: 2, label: 'Maintenance', color: '#f59e0b', icon: 'alert' }
          ],
          showLabel: true,
          animate: true
        }
      },
      {
        type: 'toggle',
        title: 'Light Control',
        dataBindings: [{
          source: 'modbus',
          path: 'coil:1:1',
          refreshRate: 500
        }],
        config: {
          onLabel: 'Lights ON',
          offLabel: 'Lights OFF',
          onColor: '#10b981',
          offColor: '#6b7280'
        }
      },
      {
        type: 'slider',
        title: 'Dimming Level',
        dataBindings: [{
          source: 'modbus',
          path: 'holding:1:100',
          refreshRate: 500
        }],
        config: {
          min: 0,
          max: 100,
          step: 1,
          unit: '%',
          showValue: true,
          color: '#8b5cf6'
        }
      },
      {
        type: 'numeric',
        title: 'Power Usage',
        dataBindings: [{
          source: 'sensor',
          path: 'power/total',
          refreshRate: 1000
        }],
        config: {
          unit: 'kW',
          decimals: 2,
          prefix: '',
          suffix: '',
          showTrend: true,
          trendThreshold: 0.1
        }
      }
    ],
    layouts: {
      lg: [
        { i: 'widget-0', x: 0, y: 0, w: 3, h: 4 },
        { i: 'widget-1', x: 3, y: 0, w: 3, h: 4 },
        { i: 'widget-2', x: 6, y: 0, w: 6, h: 4 },
        { i: 'widget-3', x: 0, y: 4, w: 6, h: 4 }
      ]
    }
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Data analytics and performance metrics',
    category: 'analytics',
    widgets: [
      {
        type: 'trend',
        title: 'Yield Trend',
        dataBindings: [{
          source: 'database',
          path: 'analytics.yield.daily',
          refreshRate: 60000
        }],
        config: {
          timeRange: '30d',
          showGrid: true,
          lines: [{
            dataKey: 'actual',
            color: '#10b981',
            name: 'Actual'
          }, {
            dataKey: 'predicted',
            color: '#8b5cf6',
            name: 'Predicted'
          }]
        }
      },
      {
        type: 'numeric',
        title: 'Current Yield',
        dataBindings: [{
          source: 'database',
          path: 'analytics.yield.current',
          refreshRate: 30000
        }],
        config: {
          unit: 'g/m²',
          decimals: 1,
          showTrend: true
        }
      },
      {
        type: 'gauge',
        title: 'Efficiency',
        dataBindings: [{
          source: 'calculation',
          path: 'efficiency.overall',
          refreshRate: 10000
        }],
        config: {
          min: 0,
          max: 100,
          unit: '%',
          thresholds: [
            { value: 80, color: '#ef4444' },
            { value: 90, color: '#f59e0b' },
            { value: 95, color: '#10b981' }
          ]
        }
      }
    ],
    layouts: {
      lg: [
        { i: 'widget-0', x: 0, y: 0, w: 8, h: 6 },
        { i: 'widget-1', x: 8, y: 0, w: 4, h: 3 },
        { i: 'widget-2', x: 8, y: 3, w: 4, h: 3 }
      ]
    }
  }
];