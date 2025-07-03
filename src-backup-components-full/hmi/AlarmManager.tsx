'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Bell, 
  BellOff,
  Check,
  X,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Activity
} from 'lucide-react';

export interface Alarm {
  id: string;
  timestamp: Date;
  equipmentId: string;
  equipmentName: string;
  type: 'critical' | 'warning' | 'info';
  category: 'temperature' | 'humidity' | 'power' | 'equipment' | 'network' | 'system';
  message: string;
  value?: number;
  unit?: string;
  threshold?: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  notes?: string;
}

interface AlarmManagerProps {
  alarms: Alarm[];
  onAcknowledge: (alarmId: string, notes?: string) => void;
  onClear: (alarmId: string) => void;
  onClearAll: () => void;
  onExport: () => void;
}

export function AlarmManager({ 
  alarms, 
  onAcknowledge, 
  onClear, 
  onClearAll,
  onExport 
}: AlarmManagerProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [expandedAlarms, setExpandedAlarms] = useState<Set<string>>(new Set());
  const [acknowledgeNotes, setAcknowledgeNotes] = useState<{ [key: string]: string }>({});
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play sound for new critical alarms
  useEffect(() => {
    if (soundEnabled) {
      const newCriticalAlarms = alarms.filter(
        alarm => alarm.type === 'critical' && !alarm.acknowledged && 
        (new Date().getTime() - new Date(alarm.timestamp).getTime()) < 5000
      );
      
      if (newCriticalAlarms.length > 0) {
        // Play alarm sound (you would implement actual sound playing here)
      }
    }
  }, [alarms, soundEnabled]);

  const filteredAlarms = alarms.filter(alarm => {
    if (filter === 'active' && (alarm.acknowledged || alarm.resolved)) return false;
    if (filter === 'acknowledged' && !alarm.acknowledged) return false;
    if (filter === 'resolved' && !alarm.resolved) return false;
    
    if (typeFilter !== 'all' && alarm.type !== typeFilter) return false;
    
    return true;
  });

  const getAlarmIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'temperature': return '🌡️';
      case 'humidity': return '💧';
      case 'power': return '⚡';
      case 'equipment': return '⚙️';
      case 'network': return '🌐';
      case 'system': return '💻';
      default: return '📋';
    }
  };

  const toggleExpanded = (alarmId: string) => {
    const newExpanded = new Set(expandedAlarms);
    if (newExpanded.has(alarmId)) {
      newExpanded.delete(alarmId);
    } else {
      newExpanded.add(alarmId);
    }
    setExpandedAlarms(newExpanded);
  };

  const handleAcknowledge = (alarm: Alarm) => {
    onAcknowledge(alarm.id, acknowledgeNotes[alarm.id]);
    setAcknowledgeNotes(prev => {
      const newNotes = { ...prev };
      delete newNotes[alarm.id];
      return newNotes;
    });
  };

  const activeCount = alarms.filter(a => !a.acknowledged && !a.resolved).length;
  const criticalCount = alarms.filter(a => a.type === 'critical' && !a.acknowledged).length;

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold">Alarm Management</h2>
            {criticalCount > 0 && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full animate-pulse">
                {criticalCount} CRITICAL
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
            >
              {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
            <button
              onClick={onExport}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Export alarms"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClearAll}
              disabled={alarms.length === 0}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
            >
              Clear All Resolved
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Alarms ({alarms.length})</option>
              <option value="active">Active ({activeCount})</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Alarms List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAlarms.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No alarms matching the current filter</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredAlarms.map(alarm => {
              const isExpanded = expandedAlarms.has(alarm.id);
              
              return (
                <div
                  key={alarm.id}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    alarm.resolved 
                      ? 'border-gray-800 bg-gray-900/50' 
                      : alarm.acknowledged 
                        ? 'border-gray-700 bg-gray-900' 
                        : alarm.type === 'critical'
                          ? 'border-red-600 bg-red-950/50'
                          : alarm.type === 'warning'
                            ? 'border-yellow-600 bg-yellow-950/50'
                            : 'border-blue-600 bg-blue-950/50'
                  }`}
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleExpanded(alarm.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAlarmIcon(alarm.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{alarm.equipmentName}</span>
                            <span className="text-2xl">{getCategoryIcon(alarm.category)}</span>
                            {alarm.acknowledged && (
                              <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded">
                                Acknowledged
                              </span>
                            )}
                            {alarm.resolved && (
                              <span className="px-2 py-0.5 bg-gray-600/20 text-gray-400 text-xs rounded">
                                Resolved
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-300">{alarm.message}</p>
                          {alarm.value !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              Value: {alarm.value}{alarm.unit} 
                              {alarm.threshold && ` (Threshold: ${alarm.threshold}${alarm.unit})`}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(alarm.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!alarm.acknowledged && !alarm.resolved && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcknowledge(alarm);
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                        {alarm.acknowledged && !alarm.resolved && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onClear(alarm.id);
                            }}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
                          >
                            Clear
                          </button>
                        )}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-800 p-4 bg-gray-900/50">
                      {alarm.acknowledged && (
                        <div className="mb-3 text-sm">
                          <p className="text-gray-400">
                            Acknowledged by: <span className="text-white">{alarm.acknowledgedBy || 'System'}</span>
                          </p>
                          <p className="text-gray-400">
                            At: <span className="text-white">
                              {alarm.acknowledgedAt ? new Date(alarm.acknowledgedAt).toLocaleString() : 'N/A'}
                            </span>
                          </p>
                        </div>
                      )}
                      
                      {alarm.resolved && (
                        <div className="mb-3 text-sm">
                          <p className="text-gray-400">
                            Resolved at: <span className="text-white">
                              {alarm.resolvedAt ? new Date(alarm.resolvedAt).toLocaleString() : 'N/A'}
                            </span>
                          </p>
                        </div>
                      )}

                      {alarm.notes && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-400 mb-1">Notes:</p>
                          <p className="text-sm bg-gray-800 p-2 rounded">{alarm.notes}</p>
                        </div>
                      )}

                      {!alarm.acknowledged && (
                        <div className="mt-3">
                          <textarea
                            placeholder="Add notes (optional)"
                            value={acknowledgeNotes[alarm.id] || ''}
                            onChange={(e) => setAcknowledgeNotes(prev => ({
                              ...prev,
                              [alarm.id]: e.target.value
                            }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:border-purple-500 focus:outline-none"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}