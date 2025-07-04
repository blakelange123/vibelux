'use client';

import React, { useState, useEffect } from 'react';
import {
  Map, Navigation, CheckCircle, Circle, AlertTriangle,
  Clock, MapPin, Camera, Bug, Leaf, TrendingUp,
  ChevronRight, Play, Pause, RotateCcw, Flag,
  ThermometerSun, Droplets, Wind, BarChart3
} from 'lucide-react';

interface ScoutingRoute {
  id: string;
  name: string;
  facility: string;
  zones: Zone[];
  totalStops: number;
  estimatedTime: number; // minutes
  lastCompleted?: Date;
  nextDue: Date;
  frequency: 'daily' | 'weekly' | 'bi-weekly';
  priority: 'standard' | 'high-risk';
}

interface Zone {
  id: string;
  name: string;
  roomType: 'veg' | 'flower' | 'mother' | 'clone';
  stops: ScoutingStop[];
  environmentalData?: {
    temperature: number;
    humidity: number;
    co2: number;
    vpd: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  lastIssues: string[];
}

interface ScoutingStop {
  id: string;
  name: string;
  location: { row: number; position: string };
  coordinates?: { x: number; y: number };
  tasks: ScoutingTask[];
  completed: boolean;
  issues: Issue[];
  notes?: string;
  photoCount: number;
}

interface ScoutingTask {
  id: string;
  type: 'visual' | 'sticky-trap' | 'soil-check' | 'leaf-sample';
  description: string;
  targetPests: string[];
  completed: boolean;
}

interface Issue {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  photoIds: string[];
  timestamp: Date;
}

export default function IPMScoutingRoute({ routeId }: { routeId: string }) {
  const [route, setRoute] = useState<ScoutingRoute | null>(null);
  const [currentZone, setCurrentZone] = useState(0);
  const [currentStop, setCurrentStop] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEnvironmental, setShowEnvironmental] = useState(true);
  const [collectedData, setCollectedData] = useState<{
    issues: Issue[];
    photos: number;
    samples: number;
  }>({ issues: [], photos: 0, samples: 0 });

  useEffect(() => {
    loadRoute();
  }, [routeId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const loadRoute = async () => {
    // Mock data - in production, fetch from API
    const mockRoute: ScoutingRoute = {
      id: routeId,
      name: 'Daily IPM Scout - Building A',
      facility: 'Main Greenhouse',
      totalStops: 24,
      estimatedTime: 45,
      lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000),
      nextDue: new Date(Date.now() + 2 * 60 * 60 * 1000),
      frequency: 'daily',
      priority: 'standard',
      zones: [
        {
          id: 'zone-1',
          name: 'Veg Room 1',
          roomType: 'veg',
          riskLevel: 'medium',
          lastIssues: ['Spider mites', 'Thrips'],
          environmentalData: {
            temperature: 75,
            humidity: 65,
            co2: 1200,
            vpd: 0.95
          },
          stops: [
            {
              id: 'stop-1',
              name: 'Row 1 - Start',
              location: { row: 1, position: 'A1' },
              completed: false,
              issues: [],
              photoCount: 0,
              tasks: [
                {
                  id: 'task-1',
                  type: 'visual',
                  description: 'Check underside of leaves for pests',
                  targetPests: ['Spider mites', 'Aphids', 'Thrips'],
                  completed: false
                },
                {
                  id: 'task-2',
                  type: 'sticky-trap',
                  description: 'Replace yellow sticky trap',
                  targetPests: ['Fungus gnats', 'Whiteflies'],
                  completed: false
                }
              ]
            },
            {
              id: 'stop-2',
              name: 'Row 1 - Middle',
              location: { row: 1, position: 'A2' },
              completed: false,
              issues: [],
              photoCount: 0,
              tasks: [
                {
                  id: 'task-3',
                  type: 'visual',
                  description: 'Inspect new growth for damage',
                  targetPests: ['Thrips', 'Leaf miners'],
                  completed: false
                }
              ]
            }
          ]
        },
        {
          id: 'zone-2',
          name: 'Veg Room 2',
          roomType: 'veg',
          riskLevel: 'high',
          lastIssues: ['Powdery mildew', 'Spider mites', 'Aphids'],
          environmentalData: {
            temperature: 78,
            humidity: 70,
            co2: 1100,
            vpd: 0.85
          },
          stops: [
            {
              id: 'stop-3',
              name: 'Row 3 - Entry',
              location: { row: 3, position: 'B1' },
              completed: false,
              issues: [],
              photoCount: 0,
              tasks: [
                {
                  id: 'task-4',
                  type: 'visual',
                  description: 'Check for powdery mildew on lower leaves',
                  targetPests: ['Powdery mildew'],
                  completed: false
                },
                {
                  id: 'task-5',
                  type: 'leaf-sample',
                  description: 'Collect leaf sample from symptomatic plant',
                  targetPests: [],
                  completed: false
                }
              ]
            }
          ]
        }
      ]
    };
    
    setRoute(mockRoute);
  };

  const getCurrentLocation = () => {
    if (!route) return null;
    const zone = route.zones[currentZone];
    const stop = zone.stops[currentStop];
    return { zone, stop };
  };

  const handleStartRoute = () => {
    setIsActive(true);
    setElapsedTime(0);
  };

  const handlePauseRoute = () => {
    setIsActive(false);
  };

  const handleCompleteStop = () => {
    if (!route) return;
    
    const zone = route.zones[currentZone];
    const stop = zone.stops[currentStop];
    stop.completed = true;
    
    // Move to next stop
    if (currentStop < zone.stops.length - 1) {
      setCurrentStop(currentStop + 1);
    } else if (currentZone < route.zones.length - 1) {
      setCurrentZone(currentZone + 1);
      setCurrentStop(0);
    } else {
      // Route complete
      handleRouteComplete();
    }
  };

  const handleReportIssue = () => {
    const location = getCurrentLocation();
    if (!location) return;
    
    // Navigate to Visual Operations with pre-filled location
    window.location.href = `/tracking/visual-ops/capture?type=pest_disease&location=${encodeURIComponent(location.zone.name + ' - ' + location.stop.name)}`;
  };

  const handleRouteComplete = () => {
    setIsActive(false);
    // Submit route data
    // Route completion data: duration, issues, photos, samples
    // Submit to API for processing and reporting
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  if (!route) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const location = getCurrentLocation();
  const progress = ((currentZone * route.zones[0].stops.length + currentStop) / route.totalStops) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Route Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{route.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {route.facility}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Est. {route.estimatedTime} min
              </span>
              <span className="flex items-center gap-1">
                <Flag className="w-4 h-4" />
                {route.totalStops} stops
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">Next Due</p>
            <p className="text-lg font-semibold text-white">
              {route.nextDue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400">Progress</span>
            <span className="text-white">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          {!isActive ? (
            <button
              onClick={handleStartRoute}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Route
            </button>
          ) : (
            <>
              <button
                onClick={handlePauseRoute}
                className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Pause className="w-5 h-5" />
                Pause
              </button>
              <div className="px-4 py-3 bg-gray-900 rounded-lg">
                <p className="text-2xl font-mono text-white">{formatTime(elapsedTime)}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {location && (
        <>
          {/* Current Location */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-purple-400" />
                Current Location
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(location.zone.riskLevel)}`}>
                {location.zone.riskLevel} risk
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Zone</p>
                <p className="text-xl font-semibold text-white">{location.zone.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Stop {currentStop + 1} of {location.zone.stops.length}
                </p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Position</p>
                <p className="text-xl font-semibold text-white">{location.stop.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {location.stop.location.position}
                </p>
              </div>
            </div>
            
            {/* Environmental Data */}
            {showEnvironmental && location.zone.environmentalData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-400 mb-1">
                    <ThermometerSun className="w-4 h-4" />
                    <span className="text-xs">Temp</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {location.zone.environmentalData.temperature}°F
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-400 mb-1">
                    <Droplets className="w-4 h-4" />
                    <span className="text-xs">RH</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {location.zone.environmentalData.humidity}%
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <Wind className="w-4 h-4" />
                    <span className="text-xs">CO₂</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {location.zone.environmentalData.co2}
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-400 mb-1">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs">VPD</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {location.zone.environmentalData.vpd}
                  </p>
                </div>
              </div>
            )}
            
            {/* Last Issues */}
            {location.zone.lastIssues.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-yellow-300 mb-1">Previous Issues in This Zone:</p>
                <div className="flex flex-wrap gap-2">
                  {location.zone.lastIssues.map(issue => (
                    <span key={issue} className="px-2 py-1 bg-yellow-800/30 text-yellow-200 rounded text-sm">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Tasks */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-400" />
              Scouting Tasks
            </h2>
            
            <div className="space-y-3 mb-6">
              {location.stop.tasks.map(task => (
                <div key={task.id} className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      task.completed = !task.completed;
                      setRoute({ ...route });
                    }}
                    className={`mt-0.5 ${task.completed ? 'text-green-500' : 'text-gray-500'}`}
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {task.description}
                    </p>
                    {task.targetPests.length > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <Bug className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-400">
                          Target: {task.targetPests.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleReportIssue}
                className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Report Issue
              </button>
              
              <button
                onClick={handleCompleteStop}
                disabled={!location.stop.tasks.every(t => t.completed)}
                className="py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                Complete Stop
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Route Statistics */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Session Statistics
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{collectedData.issues.length}</p>
            <p className="text-sm text-gray-400">Issues Found</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{collectedData.photos}</p>
            <p className="text-sm text-gray-400">Photos Taken</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{collectedData.samples}</p>
            <p className="text-sm text-gray-400">Samples Collected</p>
          </div>
        </div>
      </div>
    </div>
  );
}