'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi, WifiOff, Cloud, CloudOff, RefreshCw, 
  AlertTriangle, CheckCircle, Clock, Upload,
  X, ChevronDown, ChevronUp
} from 'lucide-react';
import { OfflineSyncService, ConnectionQualityMonitor } from '@/lib/offline-sync';

interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date;
  pendingOperations: number;
  failedOperations: number;
}

export default function OfflineIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSyncTime: new Date(),
    pendingOperations: 0,
    failedOperations: 0
  });
  const [connectionQuality, setConnectionQuality] = useState<string>('excellent');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncService = OfflineSyncService.getInstance();
    const qualityMonitor = ConnectionQualityMonitor.getInstance();

    // Subscribe to sync status changes
    const unsubscribeSync = syncService.onStatusChange(setSyncStatus);
    
    // Subscribe to connection quality changes
    const unsubscribeQuality = qualityMonitor.onQualityChange(setConnectionQuality);

    // Initial status load
    setSyncStatus(syncService.getStatus());
    setConnectionQuality(qualityMonitor.getQuality());

    return () => {
      unsubscribeSync();
      unsubscribeQuality();
    };
  }, []);

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      await OfflineSyncService.getInstance().forceSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    
    if (syncStatus.pendingOperations > 0) {
      return <Upload className="w-4 h-4 text-yellow-500" />;
    }
    
    if (syncStatus.failedOperations > 0) {
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
    
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) {
      return 'Offline';
    }
    
    if (syncStatus.pendingOperations > 0) {
      return `${syncStatus.pendingOperations} pending`;
    }
    
    if (syncStatus.failedOperations > 0) {
      return `${syncStatus.failedOperations} failed`;
    }
    
    return 'Synced';
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'good':
        return <Wifi className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <Wifi className="w-4 h-4 text-orange-500" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Compact indicator */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors shadow-lg"
      >
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getConnectionIcon()}
          <span className="text-sm text-white">{getStatusText()}</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl min-w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">Sync Status</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getConnectionIcon()}
                <span className="text-sm text-gray-300">Connection</span>
              </div>
              <span className="text-sm text-white capitalize">{connectionQuality}</span>
            </div>

            {/* Online Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {syncStatus.isOnline ? (
                  <Cloud className="w-4 h-4 text-green-500" />
                ) : (
                  <CloudOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm text-gray-300">Status</span>
              </div>
              <span className="text-sm text-white">
                {syncStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Pending Operations */}
            {syncStatus.pendingOperations > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-300">Pending</span>
                </div>
                <span className="text-sm text-white">{syncStatus.pendingOperations}</span>
              </div>
            )}

            {/* Failed Operations */}
            {syncStatus.failedOperations > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-300">Failed</span>
                </div>
                <span className="text-sm text-white">{syncStatus.failedOperations}</span>
              </div>
            )}

            {/* Last Sync */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Last sync</span>
              <span className="text-sm text-white">
                {formatLastSync(syncStatus.lastSyncTime)}
              </span>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-700 pt-3 space-y-2">
              {syncStatus.isOnline && syncStatus.pendingOperations > 0 && (
                <button
                  onClick={handleForceSync}
                  disabled={isSyncing}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Force Sync'}
                </button>
              )}

              {!syncStatus.isOnline && (
                <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3">
                  <p className="text-sm text-yellow-300">
                    Working offline. Data will sync when connection is restored.
                  </p>
                </div>
              )}

              {syncStatus.failedOperations > 0 && (
                <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3">
                  <p className="text-sm text-red-300">
                    Some operations failed to sync. They will be retried automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}