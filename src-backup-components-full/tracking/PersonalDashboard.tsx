'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Activity, Heart, TrendingUp, Clock, Zap, MapPin,
  Calendar, Target, Award, AlertCircle, Settings,
  BarChart3, LineChart, PieChart, Users, Shield,
  Download, Trash2, QrCode, Watch, Battery
} from 'lucide-react';
import { ZoneBasedTracker, PersonalInsights } from '@/lib/tracking/zone-based-tracker';

interface PersonalDashboardProps {
  onOpenSettings: () => void;
}

export function PersonalDashboard({ onOpenSettings }: PersonalDashboardProps) {
  const { user } = useUser();
  const [insights, setInsights] = useState<PersonalInsights | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const zoneTracker = new ZoneBasedTracker();

  useEffect(() => {
    if (user) {
      loadPersonalInsights();
      checkActiveSession();
    }
  }, [user, selectedPeriod]);

  const loadPersonalInsights = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const days = selectedPeriod === 'day' ? 1 : selectedPeriod === 'week' ? 7 : 30;
      const data = zoneTracker.generatePersonalInsights(user.id, days);
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkActiveSession = () => {
    // Check for active work session
    // This would be implemented with real backend integration
    setCurrentSession(null);
  };

  const handleExportData = () => {
    if (!user) return;
    
    try {
      const userData = zoneTracker.exportUserData(user.id);
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibelux-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export data');
    }
  };

  const handleDeleteData = () => {
    if (!user) return;
    
    const confirmed = confirm(
      'Are you sure you want to delete all your tracking data? This action cannot be undone.'
    );
    
    if (confirmed) {
      const success = zoneTracker.deleteUserData(user.id);
      if (success) {
        alert('Your data has been deleted successfully');
        setInsights(null);
      } else {
        alert('Failed to delete data. You may not have permission.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-6 text-center">
        <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Activity className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Activity Data Yet</h3>
        <p className="text-gray-600 mb-6">
          Start working and scanning QR codes to see your personal insights and productivity analytics.
        </p>
        <button
          onClick={() => setShowQRScanner(true)}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
        >
          <QrCode className="w-4 h-4" />
          Scan QR Code to Start
        </button>
      </div>
    );
  }

  const { dailyStats, weeklyTrends, healthInsights, performanceInsights } = insights;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Personal Dashboard</h1>
          <p className="text-gray-600">Your work insights and health analytics</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          
          <button
            onClick={onOpenSettings}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active Session Alert */}
      {currentSession && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-medium text-green-800">Currently Working</h3>
              <p className="text-sm text-green-700">
                In {currentSession.zone} • Started {new Date(currentSession.startTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Work Time</p>
              <p className="text-2xl font-bold">{Math.round(dailyStats.totalWorkTime / 60)}h</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {selectedPeriod === 'day' ? 'Today' : `This ${selectedPeriod}`}
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Plants Processed</p>
              <p className="text-2xl font-bold">{dailyStats.plantsProcessed}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Avg {Math.round(dailyStats.avgProductivity)}% quality
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Calories Burned</p>
              <p className="text-2xl font-bold">{dailyStats.caloriesBurned}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Avg {dailyStats.avgHeartRate} bpm heart rate
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Productivity</p>
              <p className="text-2xl font-bold">
                {weeklyTrends.productivityTrend === 'improving' && '↗️'}
                {weeklyTrends.productivityTrend === 'stable' && '→'}
                {weeklyTrends.productivityTrend === 'declining' && '↘️'}
                {weeklyTrends.fitnessProgress > 0 ? '+' : ''}{weeklyTrends.fitnessProgress}%
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {weeklyTrends.productivityTrend} trend
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance */}
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Weekly Performance
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Productivity Score</span>
                <span>{Math.round(dailyStats.avgProductivity)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${dailyStats.avgProductivity}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Fitness Progress</span>
                <span>{healthInsights.cardioFitnessScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${healthInsights.cardioFitnessScore}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Recovery Score</span>
                <span>{healthInsights.recoveryScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${healthInsights.recoveryScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Insights */}
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Health Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Avg Daily Calories</span>
              </div>
              <span className="font-medium">{healthInsights.avgDailyCalories}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm">Cardio Fitness</span>
              </div>
              <span className="font-medium">{healthInsights.cardioFitnessScore}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-green-500" />
                <span className="text-sm">Recovery Score</span>
              </div>
              <span className="font-medium">{healthInsights.recoveryScore}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Best Performance Zones</h4>
            <div className="space-y-2">
              {performanceInsights.bestProductivityZones.map((zone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{zone}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Optimal Working Hours</h4>
            <div className="space-y-2">
              {performanceInsights.optimalWorkingHours.map((hour, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{hour}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {performanceInsights.improvementSuggestions.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Improvement Suggestions</h4>
            <ul className="space-y-1">
              {performanceInsights.improvementSuggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Privacy & Data Controls */}
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Privacy & Data Controls
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium">Privacy Settings</div>
              <div className="text-sm text-gray-600">Control data sharing</div>
            </div>
          </button>
          
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium">Export Data</div>
              <div className="text-sm text-gray-600">Download your data</div>
            </div>
          </button>
          
          <button
            onClick={handleDeleteData}
            className="flex items-center gap-2 p-3 text-left border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-medium text-red-800">Delete Data</div>
              <div className="text-sm text-red-600">Permanently remove</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}