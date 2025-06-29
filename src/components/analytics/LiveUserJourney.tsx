'use client';

import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Clock, 
  MousePointer, 
  Eye, 
  ArrowRight, 
  Users, 
  TrendingDown,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Activity
} from 'lucide-react';

interface UserJourney {
  userId: string;
  sessionId: string;
  currentPage: string;
  timeOnPage: number;
  totalSessionTime: number;
  previousPages: Array<{
    url: string;
    timeSpent: number;
    interactions: number;
    exitRate?: number;
  }>;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceInfo: {
    browser: string;
    os: string;
    screenResolution: string;
  };
  location: {
    country: string;
    city: string;
    timezone: string;
  };
  referrer: string;
  isNewUser: boolean;
  conversionGoals: Array<{
    goal: string;
    completed: boolean;
    timestamp?: number;
  }>;
  behaviorMetrics: {
    scrollDepth: number;
    clickCount: number;
    mouseMovements: number;
    pageViews: number;
    bounceRisk: 'low' | 'medium' | 'high';
  };
}

interface LiveUserJourneyProps {
  className?: string;
  maxUsers?: number;
  updateInterval?: number;
}

export default function LiveUserJourney({
  className = '',
  maxUsers = 10,
  updateInterval = 3000
}: LiveUserJourneyProps) {
  const [activeJourneys, setActiveJourneys] = useState<UserJourney[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<UserJourney | null>(null);
  const [totalActiveUsers, setTotalActiveUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Mock pages for realistic journey simulation
  const pages = [
    '/dashboard', '/analytics', '/settings', '/billing', '/users', 
    '/projects', '/reports', '/profile', '/help', '/pricing',
    '/features', '/onboarding', '/tutorials', '/integration'
  ];

  const goals = [
    'Sign Up', 'Subscribe', 'Create Project', 'Invite User', 
    'Complete Onboarding', 'Upgrade Plan', 'Enable Feature'
  ];

  const generateMockJourney = (): UserJourney => {
    const deviceTypes: Array<'desktop' | 'mobile' | 'tablet'> = ['desktop', 'mobile', 'tablet'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
    const operatingSystems = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
    const countries = ['United States', 'United Kingdom', 'Germany', 'Japan', 'Canada', 'Australia'];
    const cities = ['New York', 'London', 'Berlin', 'Tokyo', 'Toronto', 'Sydney'];

    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const currentPageIndex = Math.floor(Math.random() * pages.length);
    const previousPageCount = Math.floor(Math.random() * 5) + 1;
    
    const previousPages = Array.from({ length: previousPageCount }, (_, i) => {
      const pageIndex = (currentPageIndex - i - 1 + pages.length) % pages.length;
      return {
        url: pages[pageIndex],
        timeSpent: Math.floor(Math.random() * 300) + 30,
        interactions: Math.floor(Math.random() * 20) + 1,
        exitRate: Math.random() * 50
      };
    }).reverse();

    const userGoals = goals.slice(0, Math.floor(Math.random() * 3) + 1).map(goal => ({
      goal,
      completed: Math.random() > 0.7,
      timestamp: Math.random() > 0.5 ? Date.now() - Math.floor(Math.random() * 3600000) : undefined
    }));

    return {
      userId: `user-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
      currentPage: pages[currentPageIndex],
      timeOnPage: Math.floor(Math.random() * 600) + 10,
      totalSessionTime: Math.floor(Math.random() * 1800) + 300,
      previousPages,
      deviceType,
      deviceInfo: {
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        os: operatingSystems[Math.floor(Math.random() * operatingSystems.length)],
        screenResolution: deviceType === 'mobile' ? '375x667' : deviceType === 'tablet' ? '768x1024' : '1920x1080'
      },
      location: {
        country: countries[Math.floor(Math.random() * countries.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        timezone: 'UTC-5'
      },
      referrer: Math.random() > 0.5 ? 'google.com' : Math.random() > 0.5 ? 'twitter.com' : 'direct',
      isNewUser: Math.random() > 0.6,
      conversionGoals: userGoals,
      behaviorMetrics: {
        scrollDepth: Math.floor(Math.random() * 100) + 1,
        clickCount: Math.floor(Math.random() * 50) + 1,
        mouseMovements: Math.floor(Math.random() * 500) + 50,
        pageViews: previousPages.length + 1,
        bounceRisk: Math.random() > 0.7 ? 'low' : Math.random() > 0.4 ? 'medium' : 'high'
      }
    };
  };

  useEffect(() => {
    const updateJourneys = () => {
      // Simulate real-time updates
      const newJourneys = Array.from({ length: maxUsers }, generateMockJourney);
      setActiveJourneys(newJourneys);
      setTotalActiveUsers(newJourneys.length);
      setIsLoading(false);
    };

    updateJourneys();
    const interval = setInterval(updateJourneys, updateInterval);

    return () => clearInterval(interval);
  }, [maxUsers, updateInterval]);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getBounceRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
            <span className="text-gray-300">Loading user journeys...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Live User Journeys</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Real-time</span>
            </div>
            <div className="px-3 py-1 bg-purple-600 rounded-lg">
              <span className="text-sm font-medium text-white">{totalActiveUsers} Active Sessions</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">New Users</span>
            </div>
            <p className="text-lg font-bold text-white">
              {activeJourneys.filter(j => j.isNewUser).length}
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Avg Session</span>
            </div>
            <p className="text-lg font-bold text-white">
              {formatTime(Math.floor(activeJourneys.reduce((sum, j) => sum + j.totalSessionTime, 0) / activeJourneys.length))}
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">High Bounce Risk</span>
            </div>
            <p className="text-lg font-bold text-white">
              {activeJourneys.filter(j => j.behaviorMetrics.bounceRisk === 'high').length}
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Page Views</span>
            </div>
            <p className="text-lg font-bold text-white">
              {activeJourneys.reduce((sum, j) => sum + j.behaviorMetrics.pageViews, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Journey List */}
        <div className="flex-1 p-6">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeJourneys.map((journey) => (
              <div
                key={journey.sessionId}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedJourney?.sessionId === journey.sessionId
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
                onClick={() => setSelectedJourney(journey)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-gray-300">
                      {getDeviceIcon(journey.deviceType)}
                      <span className="text-sm">{journey.userId.slice(-6)}</span>
                    </div>
                    {journey.isNewUser && (
                      <span className="px-2 py-1 bg-blue-600 text-xs text-white rounded">NEW</span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded ${getBounceRiskColor(journey.behaviorMetrics.bounceRisk)}`}>
                      {journey.behaviorMetrics.bounceRisk.toUpperCase()} RISK
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Globe className="w-4 h-4" />
                    <span>{journey.location.country}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-400">Current:</span>
                  <span className="text-sm text-white font-medium">{journey.currentPage}</span>
                  <span className="text-xs text-gray-500">({formatTime(journey.timeOnPage)})</span>
                </div>

                {/* Journey Path Preview */}
                <div className="flex items-center gap-2 text-xs text-gray-500 overflow-hidden">
                  {journey.previousPages.slice(-3).map((page, index) => (
                    <React.Fragment key={index}>
                      <span className="truncate">{page.url}</span>
                      {index < journey.previousPages.slice(-3).length - 1 && (
                        <ArrowRight className="w-3 h-3 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                  <ArrowRight className="w-3 h-3 flex-shrink-0 text-purple-400" />
                  <span className="text-purple-400 font-medium">{journey.currentPage}</span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{journey.behaviorMetrics.pageViews} pages</span>
                    <span>{journey.behaviorMetrics.scrollDepth}% scroll</span>
                    <span>{journey.behaviorMetrics.clickCount} clicks</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatTime(journey.totalSessionTime)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Journey Details Panel */}
        {selectedJourney && (
          <div className="w-96 border-l border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Journey Details</h3>
              <button
                onClick={() => setSelectedJourney(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">User Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">User ID</span>
                    <span className="text-sm text-white">{selectedJourney.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Session</span>
                    <span className="text-sm text-white">{selectedJourney.sessionId.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Location</span>
                    <span className="text-sm text-white">{selectedJourney.location.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Device</span>
                    <span className="text-sm text-white">{selectedJourney.deviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Browser</span>
                    <span className="text-sm text-white">{selectedJourney.deviceInfo.browser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Referrer</span>
                    <span className="text-sm text-white">{selectedJourney.referrer}</span>
                  </div>
                </div>
              </div>

              {/* Current Activity */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Current Activity</h4>
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointer className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-white">{selectedJourney.currentPage}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Time on page: {formatTime(selectedJourney.timeOnPage)}
                  </div>
                  <div className="text-xs text-gray-400">
                    Scroll depth: {selectedJourney.behaviorMetrics.scrollDepth}%
                  </div>
                </div>
              </div>

              {/* Journey Path */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Journey Path</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedJourney.previousPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{page.url}</span>
                      <span className="text-gray-500">{formatTime(page.timeSpent)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs border-t border-gray-700 pt-2">
                    <span className="text-purple-400 font-medium">{selectedJourney.currentPage}</span>
                    <span className="text-purple-400">{formatTime(selectedJourney.timeOnPage)}</span>
                  </div>
                </div>
              </div>

              {/* Conversion Goals */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Conversion Goals</h4>
                <div className="space-y-2">
                  {selectedJourney.conversionGoals.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{goal.goal}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        goal.completed ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {goal.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavior Metrics */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Behavior Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Page Views</div>
                    <div className="text-sm font-semibold text-white">{selectedJourney.behaviorMetrics.pageViews}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Clicks</div>
                    <div className="text-sm font-semibold text-white">{selectedJourney.behaviorMetrics.clickCount}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Mouse Moves</div>
                    <div className="text-sm font-semibold text-white">{selectedJourney.behaviorMetrics.mouseMovements}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Bounce Risk</div>
                    <div className={`text-sm font-semibold ${
                      selectedJourney.behaviorMetrics.bounceRisk === 'low' ? 'text-green-400' :
                      selectedJourney.behaviorMetrics.bounceRisk === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {selectedJourney.behaviorMetrics.bounceRisk.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}