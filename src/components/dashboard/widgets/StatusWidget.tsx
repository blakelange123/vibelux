'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface StatusWidgetProps {
  config: {
    title?: string;
    states: Array<{
      value: any;
      label: string;
      color: string;
      icon?: 'check' | 'x' | 'alert' | 'help';
    }>;
    showLabel?: boolean;
    animate?: boolean;
  };
  data: any;
  loading: boolean;
}

const statusIcons = {
  check: CheckCircle,
  x: XCircle,
  alert: AlertCircle,
  help: HelpCircle
};

export function StatusWidget({ config, data, loading }: StatusWidgetProps) {
  const value = data?.value;
  const { states, showLabel = true, animate = true } = config;
  
  // Find matching state
  const currentState = states.find(state => state.value === value) || states[0];
  const Icon = currentState.icon ? statusIcons[currentState.icon] : null;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.div
        key={currentState.value}
        initial={animate ? { scale: 0.8, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: currentState.color,
            boxShadow: `0 0 30px ${currentState.color}40`
          }}
        >
          {Icon && <Icon className="w-12 h-12 text-white" />}
        </div>
        
        {animate && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: currentState.color }}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {showLabel && (
        <motion.div
          key={currentState.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-lg font-semibold text-white"
        >
          {currentState.label}
        </motion.div>
      )}
    </div>
  );
}