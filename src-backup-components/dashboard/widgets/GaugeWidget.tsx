'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GaugeWidgetProps {
  config: {
    title?: string;
    min: number;
    max: number;
    unit: string;
    thresholds?: Array<{ value: number; color: string }>;
    decimals?: number;
  };
  data: any;
  loading: boolean;
}

export function GaugeWidget({ config, data, loading }: GaugeWidgetProps) {
  const value = data?.value ?? 0;
  const { min, max, unit, thresholds = [], decimals = 1 } = config;
  
  // Calculate angle for gauge needle
  const percentage = ((value - min) / (max - min)) * 100;
  const angle = -135 + (percentage * 270) / 100; // -135 to +135 degrees
  
  // Determine color based on thresholds
  const getColor = () => {
    if (!thresholds.length) return '#10b981';
    
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (value >= thresholds[i].value) {
        return thresholds[i].color;
      }
    }
    return thresholds[0]?.color || '#10b981';
  };
  
  const color = getColor();
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-full aspect-square max-w-[200px]">
        {/* Background Arc */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="#374151"
            strokeWidth="8"
            strokeDasharray={`${270 * Math.PI * 0.45} ${360 * Math.PI * 0.45}`}
            strokeDashoffset={`${45 * Math.PI * 0.45}`}
          />
        </svg>
        
        {/* Value Arc */}
        <motion.svg 
          className="absolute inset-0 w-full h-full -rotate-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${270 * Math.PI * 0.45} ${360 * Math.PI * 0.45}`}
            strokeDashoffset={`${45 * Math.PI * 0.45}`}
            initial={{ pathLength: 0 }}
            animate={{ 
              pathLength: percentage / 100,
              strokeDashoffset: `${45 * Math.PI * 0.45 + (1 - percentage / 100) * 270 * Math.PI * 0.45}`
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </motion.svg>
        
        {/* Needle */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ rotate: -135 }}
          animate={{ rotate: angle }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <div className="w-1 h-1/2 bg-white origin-bottom transform -translate-y-1/2">
            <div className="w-1 h-full bg-gradient-to-t from-white to-transparent" />
          </div>
        </motion.div>
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-gray-700 rounded-full border-2 border-gray-600" />
        </div>
        
        {/* Value Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold text-white"
          >
            {loading ? '--' : value.toFixed(decimals)}
          </motion.div>
          <div className="text-sm text-gray-400">{unit}</div>
        </div>
      </div>
      
      {/* Min/Max Labels */}
      <div className="flex justify-between w-full max-w-[200px] mt-2">
        <span className="text-xs text-gray-500">{min}</span>
        <span className="text-xs text-gray-500">{max}</span>
      </div>
    </div>
  );
}