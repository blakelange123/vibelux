'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NumericWidgetProps {
  config: {
    title?: string;
    unit: string;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    showTrend?: boolean;
    trendThreshold?: number;
  };
  data: any;
  loading: boolean;
}

export function NumericWidget({ config, data, loading }: NumericWidgetProps) {
  const value = data?.value ?? 0;
  const previousValue = data?.previousValue;
  const { unit, decimals = 1, prefix = '', suffix = '', showTrend = true, trendThreshold = 0.1 } = config;
  
  // Calculate trend
  const trend = previousValue !== undefined ? value - previousValue : 0;
  const trendPercentage = previousValue !== undefined && previousValue !== 0 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;
  
  const getTrendIcon = () => {
    if (Math.abs(trend) < trendThreshold) {
      return <Minus className="w-5 h-5 text-gray-400" />;
    }
    return trend > 0 
      ? <TrendingUp className="w-5 h-5 text-green-400" />
      : <TrendingDown className="w-5 h-5 text-red-400" />;
  };
  
  const getTrendColor = () => {
    if (Math.abs(trend) < trendThreshold) return 'text-gray-400';
    return trend > 0 ? 'text-green-400' : 'text-red-400';
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.div
        key={value}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="text-4xl lg:text-5xl font-bold text-white">
          {loading ? (
            <span className="text-gray-500">--</span>
          ) : (
            <>
              {prefix}
              {value.toFixed(decimals)}
              {suffix}
            </>
          )}
        </div>
        <div className="text-lg text-gray-400 mt-1">{unit}</div>
      </motion.div>
      
      {showTrend && previousValue !== undefined && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 mt-4 ${getTrendColor()}`}
        >
          {getTrendIcon()}
          <span className="text-sm font-medium">
            {trend >= 0 ? '+' : ''}{trend.toFixed(decimals)} ({trendPercentage.toFixed(1)}%)
          </span>
        </motion.div>
      )}
    </div>
  );
}