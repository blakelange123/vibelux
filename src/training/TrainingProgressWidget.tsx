'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap, TrendingUp, Clock, Award, ChevronRight,
  Star, Zap, Target, AlertCircle
} from 'lucide-react';

interface TrainingProgressWidgetProps {
  userId: string;
  compact?: boolean;
}

export default function TrainingProgressWidget({ userId, compact = false }: TrainingProgressWidgetProps) {
  const router = useRouter();
  
  // Mock data - in production, fetch from API
  const progress = {
    completedModules: 8,
    totalModules: 15,
    currentStreak: 5,
    nextCertification: 'Advanced AI Features',
    daysUntilExpiry: 15,
    recentScore: 92
  };

  if (compact) {
    return (
      <button
        onClick={() => router.push('/training')}
        className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 border border-gray-700 transition-colors w-full"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600/20 p-2 rounded-lg">
              <GraduationCap className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">Training Progress</p>
              <p className="text-xs text-gray-400">{progress.completedModules}/{progress.totalModules} modules</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      </button>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            Training Progress
          </h3>
          <button
            onClick={() => router.push('/training')}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Module Progress</span>
            <span className="text-white">{progress.completedModules}/{progress.totalModules}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${(progress.completedModules / progress.totalModules) * 100}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Streak</span>
            </div>
            <p className="text-lg font-semibold text-white">{progress.currentStreak} days</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Last Score</span>
            </div>
            <p className="text-lg font-semibold text-white">{progress.recentScore}%</p>
          </div>
        </div>

        {/* Next Certification */}
        <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-3">
          <p className="text-sm font-medium text-purple-300 mb-1">Next Certification</p>
          <p className="text-white">{progress.nextCertification}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-purple-900/50 rounded-full h-1">
              <div className="bg-purple-500 h-1 rounded-full" style={{ width: '65%' }} />
            </div>
            <span className="text-xs text-purple-400">65%</span>
          </div>
        </div>

        {/* Expiry Warning */}
        {progress.daysUntilExpiry <= 30 && (
          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3">
            <p className="text-sm text-yellow-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Certification expires in {progress.daysUntilExpiry} days
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => router.push('/training')}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Continue Training
        </button>
      </div>
    </div>
  );
}