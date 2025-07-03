'use client';

import React from 'react';
import { Sparkles, Zap, Layout, Wrench, ChevronRight } from 'lucide-react';
import { useAIIntegration } from '../hooks/useAIIntegration';

export function AIRecommendationsPanel() {
  const { recommendations, isAnalyzing, actions } = useAIIntegration();

  if (recommendations.length === 0 && !isAnalyzing) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'fixture': return <Zap className="w-4 h-4" />;
      case 'layout': return <Layout className="w-4 h-4" />;
      case 'optimization': return <Sparkles className="w-4 h-4" />;
      case 'equipment': return <Wrench className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="fixed top-20 right-6 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-40">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-white">AI Recommendations</h3>
        </div>
        {isAnalyzing && (
          <p className="text-xs text-gray-400 mt-1">Analyzing your design...</p>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
              index === 0 ? '' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                {getIcon(rec.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-200">{rec.message}</p>
                {rec.action && (
                  <button
                    onClick={rec.action}
                    className="mt-2 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Apply suggestion
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && !isAnalyzing && (
        <div className="p-8 text-center">
          <Sparkles className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            Your design looks great! No recommendations at this time.
          </p>
        </div>
      )}
    </div>
  );
}