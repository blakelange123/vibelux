'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SliderWidgetProps {
  config: {
    title?: string;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    showValue?: boolean;
    color?: string;
  };
  data: any;
  loading: boolean;
  onUpdate?: (value: number) => void;
}

export function SliderWidget({ config, data, loading, onUpdate }: SliderWidgetProps) {
  const value = data?.value ?? config.min;
  const { 
    min, 
    max, 
    step = 1, 
    unit = '',
    showValue = true,
    color = '#8b5cf6'
  } = config;
  
  const percentage = ((value - min) / (max - min)) * 100;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!loading && onUpdate) {
      onUpdate(Number(e.target.value));
    }
  };
  
  return (
    <div className="flex flex-col justify-center h-full">
      {showValue && (
        <div className="text-center mb-4">
          <motion.div
            key={value}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-white"
          >
            {loading ? '--' : value}
            <span className="text-lg text-gray-400 ml-1">{unit}</span>
          </motion.div>
        </div>
      )}
      
      <div className="relative">
        {/* Custom styled slider track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {/* Native range input (styled to be mostly invisible) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={loading}
          className="relative w-full h-2 bg-transparent appearance-none cursor-pointer disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}