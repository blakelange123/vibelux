'use client';

import { useState, useEffect } from 'react';
import { DebugLogger } from '@/lib/debug-logger';
import { X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export function DebugPanel() {
  const [logs, setLogs] = useState(DebugLogger.getLogs());
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const unsubscribe = DebugLogger.subscribe(setLogs);
    return unsubscribe;
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg z-50"
      >
        <AlertCircle className="w-5 h-5 text-yellow-500" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 ${isMinimized ? 'w-64' : 'w-96'} bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-50`}>
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-500" />
          Debug Console
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white"
          >
            {isMinimized ? '□' : '_'}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="max-h-96 overflow-y-auto p-3 space-y-2">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No debug logs yet...</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`text-xs p-2 rounded ${
                  log.type === 'error' ? 'bg-red-900/20 border border-red-800' :
                  log.type === 'warn' ? 'bg-yellow-900/20 border border-yellow-800' :
                  'bg-gray-800 border border-gray-700'
                }`}
              >
                <div className="flex items-start gap-2">
                  {log.type === 'error' && <AlertCircle className="w-3 h-3 text-red-500 mt-0.5" />}
                  {log.type === 'warn' && <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5" />}
                  {log.type === 'log' && <Info className="w-3 h-3 text-blue-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-gray-300 font-medium">{log.message}</p>
                    {log.details && (
                      <pre className="mt-1 text-gray-400 overflow-x-auto">
                        {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}
                      </pre>
                    )}
                    <p className="text-gray-500 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      <div className="p-2 border-t border-gray-700">
        <button
          onClick={() => DebugLogger.clearLogs()}
          className="text-xs text-gray-400 hover:text-white"
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
}