'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface Alarm {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'normal';
  message: string;
  timestamp: string | Date;
  acknowledged?: boolean;
}

interface AlarmWidgetProps {
  config: {
    title?: string;
    maxAlarms?: number;
    showAcknowledged?: boolean;
    severityFilter?: Alarm['severity'][];
    sortOrder?: 'newest' | 'oldest' | 'severity';
  };
  data: any;
  loading: boolean;
  onUpdate?: (alarmId: string, action: 'acknowledge' | 'clear') => void;
}

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'bg-red-600', textColor: 'text-red-400', priority: 4 },
  warning: { icon: AlertCircle, color: 'bg-yellow-600', textColor: 'text-yellow-400', priority: 3 },
  info: { icon: Info, color: 'bg-blue-600', textColor: 'text-blue-400', priority: 2 },
  normal: { icon: CheckCircle, color: 'bg-green-600', textColor: 'text-green-400', priority: 1 }
};

export function AlarmWidget({ config, data, loading, onUpdate }: AlarmWidgetProps) {
  const { 
    maxAlarms = 5, 
    showAcknowledged = false, 
    severityFilter,
    sortOrder = 'newest' 
  } = config;
  
  const alarms: Alarm[] = data?.alarms || [];
  
  // Filter alarms
  let filteredAlarms = alarms.filter(alarm => {
    if (!showAcknowledged && alarm.acknowledged) return false;
    if (severityFilter && !severityFilter.includes(alarm.severity)) return false;
    return true;
  });
  
  // Sort alarms
  filteredAlarms.sort((a, b) => {
    switch (sortOrder) {
      case 'oldest':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'severity':
        const aPriority = severityConfig[a.severity].priority;
        const bPriority = severityConfig[b.severity].priority;
        return bPriority - aPriority;
      case 'newest':
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });
  
  // Limit alarms
  filteredAlarms = filteredAlarms.slice(0, maxAlarms);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <Bell className="w-6 h-6 animate-pulse" />
      </div>
    );
  }
  
  if (filteredAlarms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <CheckCircle className="w-12 h-12 mb-2" />
        <span className="text-sm">No active alarms</span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="popLayout">
          {filteredAlarms.map((alarm) => {
            const { icon: Icon, color, textColor } = severityConfig[alarm.severity];
            
            return (
              <motion.div
                key={alarm.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-3 mb-2 rounded-lg bg-gray-800 border border-gray-700 ${
                  alarm.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${textColor}`}>
                      {alarm.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(alarm.timestamp), 'MMM d, HH:mm:ss')}
                    </p>
                  </div>
                  
                  {onUpdate && !alarm.acknowledged && (
                    <button
                      onClick={() => onUpdate(alarm.id, 'acknowledge')}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                      Ack
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Alarm Summary */}
      <div className="mt-2 pt-2 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{filteredAlarms.length} active</span>
          <span>{alarms.filter(a => a.acknowledged).length} acknowledged</span>
        </div>
      </div>
    </div>
  );
}