'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface TrendWidgetProps {
  config: {
    title?: string;
    timeRange: '1h' | '24h' | '7d' | '30d';
    yAxis?: { min: string | number; max: string | number };
    lines?: Array<{
      dataKey: string;
      color: string;
      name: string;
    }>;
    showGrid?: boolean;
  };
  data: any;
  loading: boolean;
}

export function TrendWidget({ config, data, loading }: TrendWidgetProps) {
  const { timeRange, yAxis, lines = [], showGrid = true } = config;
  
  // Transform data for recharts
  const chartData = useMemo(() => {
    if (!data?.series || !Array.isArray(data.series)) return [];
    
    return data.series.map((point: any) => ({
      ...point,
      time: new Date(point.timestamp).getTime()
    }));
  }, [data]);
  
  // Format time based on range
  const formatTick = (timestamp: number) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case '1h':
        return format(date, 'HH:mm');
      case '24h':
        return format(date, 'HH:mm');
      case '7d':
        return format(date, 'EEE');
      case '30d':
        return format(date, 'MMM d');
      default:
        return format(date, 'HH:mm');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading chart data...
      </div>
    );
  }
  
  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available
      </div>
    );
  }
  
  // Default line if none specified
  const defaultLines = lines.length ? lines : [{
    dataKey: 'value',
    color: '#8b5cf6',
    name: 'Value'
  }];
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              opacity={0.5}
            />
          )}
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatTick}
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis
            domain={[
              yAxis?.min === 'auto' ? 'dataMin' : yAxis?.min || 'dataMin',
              yAxis?.max === 'auto' ? 'dataMax' : yAxis?.max || 'dataMax'
            ]}
            stroke="#9ca3af"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.375rem'
            }}
            labelFormatter={(value) => format(new Date(value), 'PPpp')}
          />
          {defaultLines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              name={line.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}