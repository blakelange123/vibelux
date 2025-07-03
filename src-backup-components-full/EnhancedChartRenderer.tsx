'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface EnhancedChartProps {
  type: 'line' | 'bar' | 'pie' | 'area' | 'heatmap' | 'vector' | 'gauge' | 'scatter' | 'radar';
  title: string;
  config: any;
}

// Heatmap Component using Canvas
function HeatmapChart({ config }: { config: any }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Simulate heatmap data
    const width = canvas.width = 300;
    const height = canvas.height = 200;
    const cellSize = 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Generate simulated heatmap
    for (let x = 0; x < width; x += cellSize) {
      for (let y = 0; y < height; y += cellSize) {
        const intensity = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
        const colorIndex = Math.floor(intensity * (config.colorScale?.length || 5));
        const color = config.colorScale?.[colorIndex] || `hsl(${intensity * 240}, 70%, 50%)`;
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
    
    // Add colorbar if requested
    if (config.showColorbar) {
      const colorbarWidth = 20;
      const colorbarHeight = height - 40;
      const colorbarX = width - 30;
      const colorbarY = 20;
      
      for (let i = 0; i < colorbarHeight; i++) {
        const intensity = 1 - (i / colorbarHeight);
        const colorIndex = Math.floor(intensity * (config.colorScale?.length || 5));
        const color = config.colorScale?.[colorIndex] || `hsl(${intensity * 240}, 70%, 50%)`;
        
        ctx.fillStyle = color;
        ctx.fillRect(colorbarX, colorbarY + i, colorbarWidth, 2);
      }
      
      // Colorbar labels
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('High', colorbarX + 25, colorbarY + 10);
      ctx.fillText('Low', colorbarX + 25, colorbarY + colorbarHeight);
      
      if (config.unit) {
        ctx.fillText(config.unit, colorbarX + 25, colorbarY + colorbarHeight / 2);
      }
    }
  }, [config]);
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef}
        className="border border-gray-700 rounded"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}

// Vector Field Component
function VectorChart({ config }: { config: any }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width = 300;
    const height = canvas.height = 200;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw vector field
    const gridSpacing = 20;
    const arrowScale = config.arrowScale || 1;
    
    for (let x = gridSpacing; x < width - gridSpacing; x += gridSpacing) {
      for (let y = gridSpacing; y < height - gridSpacing; y += gridSpacing) {
        // Simulate airflow vectors
        const vx = Math.sin(x * 0.02) * arrowScale * 10;
        const vy = Math.cos(y * 0.02) * arrowScale * 10;
        
        // Draw arrow
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + vx, y + vy);
        ctx.stroke();
        
        // Arrow head
        const angle = Math.atan2(vy, vx);
        const headLength = 5;
        ctx.beginPath();
        ctx.moveTo(x + vx, y + vy);
        ctx.lineTo(
          x + vx - headLength * Math.cos(angle - Math.PI / 6),
          y + vy - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(x + vx, y + vy);
        ctx.lineTo(
          x + vx - headLength * Math.cos(angle + Math.PI / 6),
          y + vy - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    }
    
    // Add grid if requested
    if (config.showGrid) {
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  }, [config]);
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef}
        className="border border-gray-700 rounded"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}

// Gauge Component
function GaugeChart({ config }: { config: any }) {
  const { value, min = 0, max = 100, thresholds = [33, 66], colors = ['#ef4444', '#f59e0b', '#10b981'] } = config;
  
  const getColor = (val: number) => {
    if (val <= thresholds[0]) return colors[0];
    if (val <= thresholds[1]) return colors[1];
    return colors[2];
  };
  
  const angle = ((value - min) / (max - min)) * 180 - 90;
  const color = getColor(value);
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="relative w-32 h-16">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 110 50"
            fill="none"
            stroke="#374151"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 110 50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(value / max) * 157} 157`}
          />
          
          {/* Needle */}
          <line
            x1="60"
            y1="50"
            x2={60 + 30 * Math.cos((angle * Math.PI) / 180)}
            y2={50 + 30 * Math.sin((angle * Math.PI) / 180)}
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Center dot */}
          <circle cx="60" cy="50" r="3" fill="#ffffff" />
        </svg>
      </div>
      
      <div className="text-center mt-2">
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
        <div className="text-xs text-gray-400">{min} - {max}</div>
      </div>
    </div>
  );
}

export function EnhancedChartRenderer({ type, title, config }: EnhancedChartProps) {
  const renderChart = () => {
    // Validate config exists
    if (!config) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>No configuration available</p>
        </div>
      );
    }
    
    // Ensure config.data is an array for chart types that need it
    const chartTypesNeedingData = ['line', 'bar', 'area', 'pie', 'scatter', 'radar', 'combo'];
    if (chartTypesNeedingData.includes(type) && !Array.isArray(config.data)) {
      console.error('Chart data must be an array for type:', type, 'Received:', typeof config.data);
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Invalid data format for chart</p>
        </div>
      );
    }
    
    // Ensure we have at least one data point for data-driven charts
    if (chartTypesNeedingData.includes(type) && (!config.data || config.data.length === 0)) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>No data points to display</p>
        </div>
      );
    }
    
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={config.data}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              {config.showLegend && <Legend wrapperStyle={{ color: '#e5e7eb' }} />}
              {config.data && config.data.length > 0 && Object.keys(config.data[0] || {}).filter(key => key !== 'name').map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={`hsl(${index * 60}, 70%, 50%)`}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={config.data}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              {config.showLegend && <Legend wrapperStyle={{ color: '#e5e7eb' }} />}
              {config.data && config.data.length > 0 && Object.keys(config.data[0] || {}).filter(key => key !== 'name').map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={`hsl(${index * 60}, 70%, 50%)`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={config.data}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              {config.showLegend && <Legend wrapperStyle={{ color: '#e5e7eb' }} />}
              {config.data && config.data.length > 0 && Object.keys(config.data[0] || {}).filter(key => key !== 'name').map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={`hsl(${index * 60}, 70%, 50%)`}
                  fill={`hsl(${index * 60}, 70%, 50%)`}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={config.data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {config.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              {config.showLegend && <Legend wrapperStyle={{ color: '#e5e7eb' }} />}
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="x" type="number" name={config.xAxis} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis dataKey="y" type="number" name={config.yAxis} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
                formatter={(value, name, props) => [value, props.payload?.room || name]}
              />
              <Scatter fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={config.data}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
              <Radar
                name="Optimal"
                dataKey="optimal"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
              />
              <Legend wrapperStyle={{ color: '#e5e7eb' }} />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'heatmap':
        return <HeatmapChart config={config} />;

      case 'vector':
        return <VectorChart config={config} />;

      case 'gauge':
        return <GaugeChart config={config} />;

      default:
        return <div className="flex items-center justify-center h-full text-gray-400">Chart type not supported</div>;
    }
  };

  return (
    <div className="w-full h-full">
      {renderChart()}
    </div>
  );
}