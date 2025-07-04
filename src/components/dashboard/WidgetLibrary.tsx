'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  X, Gauge, LineChart, BarChart3, Activity, Thermometer,
  Droplets, Wind, Sun, Video, AlertTriangle, ToggleLeft,
  Sliders, Table, PieChart, Map, Clock, Battery, Zap,
  TrendingUp, Grid3x3, FileText, Camera
} from 'lucide-react';

interface WidgetType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'display' | 'control' | 'chart' | 'utility';
  defaultConfig: any;
}

const widgetTypes: WidgetType[] = [
  // Display Widgets
  {
    id: 'gauge',
    name: 'Gauge',
    description: 'Circular gauge for single values',
    icon: Gauge,
    category: 'display',
    defaultConfig: {
      title: 'Temperature',
      min: 0,
      max: 100,
      unit: '°F',
      thresholds: [
        { value: 70, color: '#10b981' },
        { value: 80, color: '#f59e0b' },
        { value: 90, color: '#ef4444' }
      ]
    }
  },
  {
    id: 'numeric',
    name: 'Numeric Display',
    description: 'Large numeric value display',
    icon: FileText,
    category: 'display',
    defaultConfig: {
      title: 'Humidity',
      unit: '%',
      decimals: 1,
      prefix: '',
      suffix: ''
    }
  },
  {
    id: 'status',
    name: 'Status Indicator',
    description: 'On/Off status with color coding',
    icon: Activity,
    category: 'display',
    defaultConfig: {
      title: 'System Status',
      states: [
        { value: 0, label: 'Stopped', color: '#ef4444', icon: 'x' },
        { value: 1, label: 'Running', color: '#10b981', icon: 'check' },
        { value: 2, label: 'Warning', color: '#f59e0b', icon: 'alert' }
      ],
      showLabel: true,
      animate: true
    }
  },
  
  // Control Widgets
  {
    id: 'toggle',
    name: 'Toggle Switch',
    description: 'On/Off control switch',
    icon: ToggleLeft,
    category: 'control',
    defaultConfig: {
      title: 'Light Control',
      onLabel: 'ON',
      offLabel: 'OFF'
    }
  },
  {
    id: 'slider',
    name: 'Slider',
    description: 'Value adjustment slider',
    icon: Sliders,
    category: 'control',
    defaultConfig: {
      title: 'Dimming Level',
      min: 0,
      max: 100,
      step: 1,
      unit: '%'
    }
  },
  {
    id: 'setpoint',
    name: 'Setpoint Control',
    description: 'Numeric input with increment/decrement',
    icon: Sliders,
    category: 'control',
    defaultConfig: {
      title: 'Temperature Setpoint',
      min: 50,
      max: 90,
      step: 0.5,
      unit: '°F'
    }
  },
  
  // Chart Widgets
  {
    id: 'trend',
    name: 'Trend Chart',
    description: 'Time-series line chart',
    icon: LineChart,
    category: 'chart',
    defaultConfig: {
      title: 'Temperature Trend',
      timeRange: '1h', // 1h, 24h, 7d, 30d
      yAxis: { min: 'auto', max: 'auto' },
      lines: []
    }
  },
  {
    id: 'bar',
    name: 'Bar Chart',
    description: 'Comparative bar chart',
    icon: BarChart3,
    category: 'chart',
    defaultConfig: {
      title: 'Zone Comparison',
      orientation: 'vertical', // vertical, horizontal
      showValues: true
    }
  },
  {
    id: 'heatmap',
    name: 'Heatmap',
    description: 'Grid-based value visualization',
    icon: Grid3x3,
    category: 'chart',
    defaultConfig: {
      title: 'PPFD Distribution',
      rows: 10,
      cols: 10,
      colorScale: 'viridis'
    }
  },
  {
    id: 'pie',
    name: 'Pie Chart',
    description: 'Distribution visualization',
    icon: PieChart,
    category: 'chart',
    defaultConfig: {
      title: 'Energy Usage',
      showLabels: true,
      showPercentages: true
    }
  },
  
  // Utility Widgets
  {
    id: 'alarm',
    name: 'Alarm List',
    description: 'Active alarms display',
    icon: AlertTriangle,
    category: 'utility',
    defaultConfig: {
      title: 'Active Alarms',
      maxAlarms: 5,
      showAcknowledged: false,
      severityFilter: ['critical', 'warning'],
      sortOrder: 'newest'
    }
  },
  {
    id: 'camera',
    name: 'Camera Feed',
    description: 'Live video stream',
    icon: Camera,
    category: 'utility',
    defaultConfig: {
      title: 'Room Camera',
      streamUrl: '',
      mode: 'webrtc',
      resolution: 'medium'
    }
  },
  {
    id: 'table',
    name: 'Data Table',
    description: 'Tabular data display',
    icon: Table,
    category: 'utility',
    defaultConfig: {
      title: 'Sensor Readings',
      columns: [],
      pageSize: 10
    }
  },
  {
    id: 'clock',
    name: 'Clock',
    description: 'Current time display',
    icon: Clock,
    category: 'utility',
    defaultConfig: {
      title: 'System Time',
      format: '24h',
      showDate: true,
      timezone: 'local'
    }
  }
];

interface WidgetLibraryProps {
  onClose: () => void;
  onAddWidget: (type: string, config: any) => void;
}

export function WidgetLibrary({ onClose, onAddWidget }: WidgetLibraryProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  
  const categories = [
    { id: 'all', name: 'All Widgets' },
    { id: 'display', name: 'Display' },
    { id: 'control', name: 'Control' },
    { id: 'chart', name: 'Charts' },
    { id: 'utility', name: 'Utility' }
  ];
  
  const filteredWidgets = selectedCategory === 'all' 
    ? widgetTypes 
    : widgetTypes.filter(w => w.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Widget Library</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-700">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Widget Grid */}
        <div className="p-6 overflow-auto max-h-[calc(80vh-180px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWidgets.map((widget) => {
              const Icon = widget.icon;
              return (
                <motion.button
                  key={widget.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAddWidget(widget.id, widget.defaultConfig)}
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-purple-600/20 transition-colors">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">
                        {widget.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}