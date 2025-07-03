'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Power } from 'lucide-react';

interface ToggleWidgetProps {
  config: {
    title?: string;
    onLabel?: string;
    offLabel?: string;
    onColor?: string;
    offColor?: string;
  };
  data: any;
  loading: boolean;
  onUpdate?: (value: boolean) => void;
}

export function ToggleWidget({ config, data, loading, onUpdate }: ToggleWidgetProps) {
  const value = data?.value ?? false;
  const { 
    onLabel = 'ON', 
    offLabel = 'OFF',
    onColor = '#10b981',
    offColor = '#6b7280'
  } = config;
  
  const handleToggle = () => {
    if (!loading && onUpdate) {
      onUpdate(!value);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative w-32 h-32 rounded-full transition-all duration-300 ${
          loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{
          backgroundColor: value ? onColor : offColor,
          boxShadow: value 
            ? `0 0 30px ${onColor}40, inset 0 0 20px ${onColor}20`
            : 'inset 0 0 20px rgba(0,0,0,0.3)'
        }}
      >
        <motion.div
          animate={{
            scale: value ? [1, 1.1, 1] : 1,
            opacity: value ? 1 : 0.7
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Power className={`w-12 h-12 ${value ? 'text-white' : 'text-gray-400'}`} />
        </motion.div>
      </button>
      
      <motion.div
        key={value ? 'on' : 'off'}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-lg font-semibold text-white"
      >
        {value ? onLabel : offLabel}
      </motion.div>
    </div>
  );
}