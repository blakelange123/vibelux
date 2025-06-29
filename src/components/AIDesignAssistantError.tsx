'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, Zap, Calculator } from 'lucide-react';

interface AIErrorProps {
  error: string;
  retryAfter?: number;
}

export function AIDesignAssistantError({ error, retryAfter }: AIErrorProps) {
  const [timeRemaining, setTimeRemaining] = useState(retryAfter || 0);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const isRateLimit = error.includes('rate limit');
  
  return (
    <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-300 font-medium mb-2">
            {error}
          </p>
          
          {isRateLimit && (
            <>
              {timeRemaining > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <Clock className="w-4 h-4" />
                  <span>Retry available in {timeRemaining} seconds</span>
                </div>
              )}
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">
                  While waiting, you can:
                </p>
                <div className="space-y-1">
                  <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                    <Calculator className="w-4 h-4" />
                    Use manual PPFD calculator
                  </button>
                  <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                    <Zap className="w-4 h-4" />
                    Browse fixture library
                  </button>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-gray-800 rounded text-xs text-gray-400">
                <p className="font-medium mb-1">💡 Pro tip for large greenhouses:</p>
                <p>Break your 100' x 200' greenhouse into smaller zones:</p>
                <ul className="mt-1 space-y-0.5 ml-4">
                  <li>• "Design zone 1: 50' x 40' with 2 benches"</li>
                  <li>• "Add zone 2: another 50' x 40' section"</li>
                  <li>• Continue until complete</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}