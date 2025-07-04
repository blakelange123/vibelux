'use client';

import React from 'react';
import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder';

export default function DashboardDemoPage() {
  // Demo dashboard with pre-configured widgets
  const demoDashboard = {
    name: 'Environmental Control Demo',
    widgets: [
      {
        id: 'temp-gauge',
        type: 'gauge',
        title: 'Zone Temperature',
        dataBindings: [{
          source: 'sensor',
          path: 'zone1/temperature',
          refreshRate: 2000
        }],
        config: {
          min: 60,
          max: 85,
          unit: '°F',
          thresholds: [
            { value: 70, color: '#10b981' },
            { value: 75, color: '#f59e0b' },
            { value: 80, color: '#ef4444' }
          ]
        }
      },
      {
        id: 'humidity-gauge',
        type: 'gauge',
        title: 'Zone Humidity',
        dataBindings: [{
          source: 'sensor',
          path: 'zone1/humidity',
          refreshRate: 2000
        }],
        config: {
          min: 30,
          max: 80,
          unit: '%',
          thresholds: [
            { value: 60, color: '#10b981' },
            { value: 70, color: '#f59e0b' },
            { value: 75, color: '#ef4444' }
          ]
        }
      },
      {
        id: 'ppfd-heatmap',
        type: 'heatmap',
        title: 'PPFD Distribution',
        dataBindings: [{
          source: 'calculation',
          path: 'ppfd.grid',
          refreshRate: 5000
        }],
        config: {
          rows: 8,
          cols: 12,
          colorScale: 'viridis',
          min: 0,
          max: 1000,
          showValues: false,
          unit: 'μmol/m²/s'
        }
      },
      {
        id: 'light-toggle',
        type: 'toggle',
        title: 'Light Control',
        dataBindings: [{
          source: 'modbus',
          path: 'coil:1:0',
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
        id: 'dimmer-slider',
        type: 'slider',
        title: 'Light Intensity',
        dataBindings: [{
          source: 'modbus',
          path: 'holding:1:100',
          refreshRate: 500
        }],
        config: {
          min: 0,
          max: 100,
          step: 5,
          unit: '%',
          showValue: true,
          color: '#8b5cf6'
        }
      },
      {
        id: 'system-status',
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
            { value: 1, label: 'Running', color: '#10b981', icon: 'check' },
            { value: 2, label: 'Warning', color: '#f59e0b', icon: 'alert' }
          ],
          showLabel: true,
          animate: true
        }
      },
      {
        id: 'alarm-list',
        type: 'alarm',
        title: 'Active Alarms',
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
      },
      {
        id: 'temp-trend',
        type: 'trend',
        title: 'Temperature History',
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
      }
    ],
    layouts: {
      lg: [
        { i: 'temp-gauge', x: 0, y: 0, w: 3, h: 4 },
        { i: 'humidity-gauge', x: 3, y: 0, w: 3, h: 4 },
        { i: 'ppfd-heatmap', x: 6, y: 0, w: 6, h: 8 },
        { i: 'light-toggle', x: 0, y: 4, w: 3, h: 4 },
        { i: 'dimmer-slider', x: 3, y: 4, w: 3, h: 4 },
        { i: 'system-status', x: 0, y: 8, w: 3, h: 4 },
        { i: 'alarm-list', x: 3, y: 8, w: 5, h: 4 },
        { i: 'temp-trend', x: 8, y: 8, w: 4, h: 4 }
      ]
    }
  };

  return (
    <div className="h-screen bg-gray-950">
      <DashboardBuilder 
        initialDashboard={demoDashboard}
        readOnly={false}
        onSave={(dashboard) => {
          // In a real app, save to database
        }}
      />
    </div>
  );
}