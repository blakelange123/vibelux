export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'environment' | 'operations' | 'analytics';
  widgets: Array<{
    type: string;
    title: string;
    dataBindings: Array<{
      source: 'modbus' | 'sensor' | 'database' | 'calculation' | 'websocket';
      path: string;
      refreshRate?: number;
      transform?: string;
    }>;
    config: any;
  }>;
  layouts: { [key: string]: any[] };
}

export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'environment-monitoring',
    name: 'Environment Monitoring',
    description: 'Monitor temperature, humidity, CO2, and light levels',
    category: 'environment',
    widgets: [
      {
        type: 'gauge',
        title: 'Temperature',
        dataBindings: [{
          source: 'sensor',
          path: 'temperature.current',
          refreshRate: 5000
        }],
        config: {
          min: 60,
          max: 90,
          unit: '°F',
          thresholds: [
            { value: 70, color: '#22c55e' },
            { value: 80, color: '#eab308' },
            { value: 85, color: '#ef4444' }
          ]
        }
      },
      {
        type: 'gauge',
        title: 'Humidity',
        dataBindings: [{
          source: 'sensor',
          path: 'humidity.current',
          refreshRate: 5000
        }],
        config: {
          min: 0,
          max: 100,
          unit: '%',
          thresholds: [
            { value: 40, color: '#ef4444' },
            { value: 60, color: '#22c55e' },
            { value: 80, color: '#eab308' }
          ]
        }
      },
      {
        type: 'trend',
        title: 'Temperature Trend',
        dataBindings: [{
          source: 'database',
          path: 'temperature.history',
          refreshRate: 60000
        }],
        config: {
          timeRange: '24h',
          yAxis: { min: 60, max: 90 }
        }
      }
    ],
    layouts: {
      lg: [
        { i: 'widget-0', x: 0, y: 0, w: 3, h: 3 },
        { i: 'widget-1', x: 3, y: 0, w: 3, h: 3 },
        { i: 'widget-2', x: 0, y: 3, w: 6, h: 4 }
      ]
    }
  },
  {
    id: 'operations-overview',
    name: 'Operations Overview',
    description: 'Track equipment status, energy usage, and alerts',
    category: 'operations',
    widgets: [
      {
        type: 'status',
        title: 'Equipment Status',
        dataBindings: [{
          source: 'modbus',
          path: 'equipment.status',
          refreshRate: 1000
        }],
        config: {
          items: ['HVAC', 'Lights', 'Irrigation', 'CO2']
        }
      },
      {
        type: 'metric',
        title: 'Energy Usage',
        dataBindings: [{
          source: 'database',
          path: 'energy.current',
          refreshRate: 30000
        }],
        config: {
          unit: 'kWh',
          decimals: 2
        }
      }
    ],
    layouts: {
      lg: [
        { i: 'widget-0', x: 0, y: 0, w: 6, h: 3 },
        { i: 'widget-1', x: 6, y: 0, w: 3, h: 3 }
      ]
    }
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Analyze trends, patterns, and predictions',
    category: 'analytics',
    widgets: [
      {
        type: 'heatmap',
        title: 'PPFD Distribution',
        dataBindings: [{
          source: 'calculation',
          path: 'ppfd.grid',
          refreshRate: 300000
        }],
        config: {
          colorScale: 'viridis',
          min: 0,
          max: 1000
        }
      },
      {
        type: 'trend',
        title: 'Yield Prediction',
        dataBindings: [{
          source: 'database',
          path: 'predictions.yield',
          refreshRate: 3600000
        }],
        config: {
          timeRange: '30d',
          showPrediction: true
        }
      }
    ],
    layouts: {
      lg: [
        { i: 'widget-0', x: 0, y: 0, w: 6, h: 4 },
        { i: 'widget-1', x: 6, y: 0, w: 6, h: 4 }
      ]
    }
  }
];