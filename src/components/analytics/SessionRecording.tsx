'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2,
  MousePointer,
  Eye,
  Clock,
  User,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Activity,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface SessionEvent {
  timestamp: number;
  type: 'click' | 'hover' | 'scroll' | 'input' | 'navigation' | 'resize';
  target: {
    element: string;
    xpath: string;
    text?: string;
    value?: string;
  };
  coordinates?: { x: number; y: number };
  scrollPosition?: { x: number; y: number };
  viewport?: { width: number; height: number };
  url?: string;
}

interface SessionData {
  sessionId: string;
  userId: string;
  startTime: number;
  endTime: number;
  duration: number;
  pageViews: number;
  clicks: number;
  scrollEvents: number;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    screenResolution: string;
  };
  location: {
    country: string;
    city: string;
    ip: string;
  };
  events: SessionEvent[];
  pages: Array<{
    url: string;
    title: string;
    timeSpent: number;
    interactions: number;
  }>;
  conversionEvents: Array<{
    type: string;
    timestamp: number;
    value?: number;
  }>;
  heatmapData: Array<{
    x: number;
    y: number;
    intensity: number;
    type: 'click' | 'hover';
  }>;
}

interface SessionRecordingProps {
  className?: string;
  sessionId?: string;
  showControls?: boolean;
  autoPlay?: boolean;
}

export default function SessionRecording({
  className = '',
  sessionId,
  showControls = true,
  autoPlay = false
}: SessionRecordingProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [filterDuration, setFilterDuration] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef<HTMLDivElement>(null);
  const playbackInterval = useRef<NodeJS.Timeout | null>(null);

  // Generate mock session data
  const generateMockSessions = (): SessionData[] => {
    const devices = [
      { type: 'desktop' as const, browser: 'Chrome', os: 'Windows', resolution: '1920x1080' },
      { type: 'mobile' as const, browser: 'Safari', os: 'iOS', resolution: '375x667' },
      { type: 'tablet' as const, browser: 'Chrome', os: 'Android', resolution: '768x1024' }
    ];

    const locations = [
      { country: 'United States', city: 'New York', ip: '192.168.1.1' },
      { country: 'United Kingdom', city: 'London', ip: '192.168.1.2' },
      { country: 'Germany', city: 'Berlin', ip: '192.168.1.3' }
    ];

    const pages = [
      { url: '/dashboard', title: 'Dashboard' },
      { url: '/analytics', title: 'Analytics' },
      { url: '/settings', title: 'Settings' },
      { url: '/billing', title: 'Billing' },
      { url: '/users', title: 'Users' }
    ];

    return Array.from({ length: 20 }, (_, i) => {
      const device = devices[Math.floor(Math.random() * devices.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const sessionDuration = Math.floor(Math.random() * 1800) + 300; // 5-35 minutes
      const startTime = Date.now() - Math.floor(Math.random() * 86400000); // Last 24 hours
      
      const events: SessionEvent[] = [];
      const sessionPages = pages.slice(0, Math.floor(Math.random() * 4) + 1);
      let eventTime = startTime;

      // Generate events throughout the session
      for (let j = 0; j < Math.floor(Math.random() * 100) + 20; j++) {
        eventTime += Math.floor(Math.random() * 30000) + 1000; // 1-30 seconds between events
        
        const eventTypes: SessionEvent['type'][] = ['click', 'hover', 'scroll', 'input', 'navigation'];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        events.push({
          timestamp: eventTime,
          type: eventType,
          target: {
            element: `btn-${Math.random().toString(36).substr(2, 5)}`,
            xpath: `/html/body/div[${Math.floor(Math.random() * 5) + 1}]`,
            text: eventType === 'input' ? `Input text ${j}` : undefined,
            value: eventType === 'input' ? `value-${j}` : undefined
          },
          coordinates: {
            x: Math.floor(Math.random() * (device.type === 'mobile' ? 375 : device.type === 'tablet' ? 768 : 1920)),
            y: Math.floor(Math.random() * (device.type === 'mobile' ? 667 : device.type === 'tablet' ? 1024 : 1080))
          },
          scrollPosition: eventType === 'scroll' ? {
            x: 0,
            y: Math.floor(Math.random() * 2000)
          } : undefined,
          viewport: {
            width: parseInt(device.resolution.split('x')[0]),
            height: parseInt(device.resolution.split('x')[1])
          },
          url: sessionPages[Math.floor(Math.random() * sessionPages.length)].url
        });
      }

      const heatmapData = events
        .filter(e => e.type === 'click' || e.type === 'hover')
        .map(e => ({
          x: e.coordinates?.x || 0,
          y: e.coordinates?.y || 0,
          intensity: Math.random() * 0.8 + 0.2,
          type: e.type as 'click' | 'hover'
        }));

      return {
        sessionId: `session-${i + 1}`,
        userId: `user-${Math.floor(Math.random() * 1000) + 1}`,
        startTime,
        endTime: startTime + sessionDuration * 1000,
        duration: sessionDuration,
        pageViews: sessionPages.length,
        clicks: events.filter(e => e.type === 'click').length,
        scrollEvents: events.filter(e => e.type === 'scroll').length,
        device: {
          type: device.type,
          browser: device.browser,
          os: device.os,
          screenResolution: device.resolution
        },
        location,
        events,
        pages: sessionPages.map(page => ({
          url: page.url,
          title: page.title,
          timeSpent: Math.floor(Math.random() * 300) + 30,
          interactions: Math.floor(Math.random() * 20) + 5
        })),
        conversionEvents: Math.random() > 0.7 ? [{
          type: 'signup',
          timestamp: startTime + Math.floor(Math.random() * sessionDuration * 1000),
          value: Math.floor(Math.random() * 100) + 50
        }] : [],
        heatmapData
      };
    });
  };

  useEffect(() => {
    const loadSessions = () => {
      const mockSessions = generateMockSessions();
      setSessions(mockSessions);
      
      if (sessionId) {
        const session = mockSessions.find(s => s.sessionId === sessionId);
        if (session) {
          setSelectedSession(session);
        }
      }
      
      setIsLoading(false);
    };

    loadSessions();
  }, [sessionId]);

  useEffect(() => {
    if (selectedSession && autoPlay) {
      setIsPlaying(true);
    }
  }, [selectedSession, autoPlay]);

  useEffect(() => {
    if (isPlaying && selectedSession) {
      playbackInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          const nextTime = prev + (1000 * playbackSpeed);
          if (nextTime >= selectedSession.duration * 1000) {
            setIsPlaying(false);
            return selectedSession.duration * 1000;
          }
          return nextTime;
        });
      }, 1000);
    } else {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
        playbackInterval.current = null;
      }
    }

    return () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    };
  }, [isPlaying, playbackSpeed, selectedSession]);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.location.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDevice = filterDevice === 'all' || session.device.type === filterDevice;
    
    const matchesDuration = filterDuration === 'all' ||
                           (filterDuration === 'short' && session.duration < 300) ||
                           (filterDuration === 'medium' && session.duration >= 300 && session.duration < 900) ||
                           (filterDuration === 'long' && session.duration >= 900);

    return matchesSearch && matchesDevice && matchesDuration;
  });

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getCurrentEvents = () => {
    if (!selectedSession) return [];
    return selectedSession.events.filter(event => 
      event.timestamp - selectedSession.startTime <= currentTime
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
            <span className="text-gray-300">Loading session recordings...</span>
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
            <Eye className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Session Recordings</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-1 rounded text-sm ${
                showHeatmap ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Heatmap
            </button>
            <button className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm w-48"
            />
          </div>
          
          <select
            value={filterDevice}
            onChange={(e) => setFilterDevice(e.target.value)}
            className="px-3 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>

          <select
            value={filterDuration}
            onChange={(e) => setFilterDuration(e.target.value)}
            className="px-3 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
          >
            <option value="all">All Durations</option>
            <option value="short">Short (&lt; 5min)</option>
            <option value="medium">Medium (5-15min)</option>
            <option value="long">Long (&gt; 15min)</option>
          </select>
        </div>
      </div>

      <div className="flex">
        {/* Session List */}
        <div className="w-96 border-r border-gray-700 p-6">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSessions.map((session) => (
              <div
                key={session.sessionId}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedSession?.sessionId === session.sessionId
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(session.device.type)}
                    <span className="text-sm text-white">{session.userId}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTime(session.duration * 1000)}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  {session.sessionId}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{session.pageViews} pages</span>
                    <span>{session.clicks} clicks</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{session.location.country}</span>
                  </div>
                </div>

                {session.conversionEvents.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                      Converted
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Session Player */}
        {selectedSession ? (
          <div className="flex-1 p-6">
            {/* Session Info */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Session: {selectedSession.sessionId}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{selectedSession.userId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(selectedSession.startTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedSession.location.city}, {selectedSession.location.country}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Duration</div>
                  <div className="text-lg font-bold text-white">
                    {formatTime(selectedSession.duration * 1000)}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Page Views</div>
                  <div className="text-lg font-bold text-white">{selectedSession.pageViews}</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Clicks</div>
                  <div className="text-lg font-bold text-white">{selectedSession.clicks}</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Device</div>
                  <div className="text-lg font-bold text-white capitalize">{selectedSession.device.type}</div>
                </div>
              </div>
            </div>

            {/* Video Player */}
            <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
              <div 
                ref={videoRef}
                className="relative bg-gray-800 flex items-center justify-center"
                style={{ height: '400px' }}
              >
                {/* Simulated screen recording */}
                <div className="text-center text-gray-400">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Session Recording Playback</p>
                  <p className="text-sm">Time: {formatTime(currentTime)}</p>
                  <p className="text-sm">Events: {getCurrentEvents().length}</p>
                </div>

                {/* Event overlay */}
                {showHeatmap && selectedSession.heatmapData.map((point, index) => (
                  <div
                    key={index}
                    className={`absolute w-4 h-4 rounded-full opacity-60 ${
                      point.type === 'click' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{
                      left: `${(point.x / parseInt(selectedSession.device.screenResolution.split('x')[0])) * 100}%`,
                      top: `${(point.y / parseInt(selectedSession.device.screenResolution.split('x')[1])) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
              </div>

              {/* Player Controls */}
              {showControls && (
                <div className="p-4 bg-gray-800 border-t border-gray-700">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlay}
                      className="flex items-center justify-center w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full text-white"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => handleSeek(0)}
                      className="p-2 text-gray-400 hover:text-white"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleSeek(selectedSession.duration * 1000)}
                      className="p-2 text-gray-400 hover:text-white"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>

                    {/* Progress bar */}
                    <div className="flex-1 mx-4">
                      <input
                        type="range"
                        min={0}
                        max={selectedSession.duration * 1000}
                        value={currentTime}
                        onChange={(e) => handleSeek(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="text-sm text-gray-400">
                      {formatTime(currentTime)} / {formatTime(selectedSession.duration * 1000)}
                    </div>

                    {/* Speed control */}
                    <select
                      value={playbackSpeed}
                      onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                      className="px-2 py-1 bg-gray-700 text-white rounded text-sm"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Session Timeline */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Session Timeline</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {getCurrentEvents().slice(-10).map((event, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <MousePointer className="w-3 h-3 text-purple-400" />
                      <span className="text-gray-300">{event.type}</span>
                      <span className="text-gray-500">{event.target.element}</span>
                    </div>
                    <span className="text-gray-400">
                      {formatTime(event.timestamp - selectedSession.startTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a session to view recording</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}