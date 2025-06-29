'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DataPoint {
  timestamp: Date;
  value: number;
}

interface TelemetryChartProps {
  data: DataPoint[];
  label: string;
  unit: string;
  color?: string;
  height?: number;
  showLegend?: boolean;
  min?: number;
  max?: number;
}

export function TelemetryChart({ 
  data, 
  label, 
  unit, 
  color = '#8B5CF6',
  height = 200,
  showLegend = false,
  min,
  max
}: TelemetryChartProps) {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [{
      label: `${label} (${unit})`,
      data: [] as number[],
      borderColor: color,
      backgroundColor: `${color}20`,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4
    }]
  });

  useEffect(() => {
    const labels = data.map(d => 
      new Date(d.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    );
    
    const values = data.map(d => d.value);

    setChartData({
      labels,
      datasets: [{
        label: `${label} (${unit})`,
        data: values,
        borderColor: color,
        backgroundColor: `${color}20`,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    });
  }, [data, label, unit, color]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          color: '#9CA3AF',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFF',
        bodyColor: '#FFF',
        borderColor: color,
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6
        }
      },
      y: {
        min,
        max,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 10
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

// Sparkline component for inline charts
interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ 
  data, 
  color = '#8B5CF6',
  width = 100,
  height = 30
}: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
      <polyline
        fill={`${color}20`}
        stroke="none"
        points={`0,${height} ${points} ${width},${height}`}
      />
    </svg>
  );
}