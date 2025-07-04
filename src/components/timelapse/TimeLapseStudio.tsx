'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Play, Pause, Square, Camera, Video, Settings, Download,
  FastForward, Rewind, SkipBack, SkipForward, Volume2,
  Calendar, Clock, TrendingUp, Share2, Edit, Trash2,
  Plus, Eye, BarChart3, Target, Award, Film, Maximize,
  Minimize, RotateCcw, Zap, Instagram, Twitter, Youtube,
  Smartphone, Monitor, Square as SquareIcon, X, Sparkles
} from 'lucide-react';
import { TimeLapseEngine, TimeLapseProject, CompiledVideo } from '@/lib/timelapse/timelapse-engine';

export function TimeLapseStudio() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState<'projects' | 'videos' | 'analytics'>('projects');
  const [projects, setProjects] = useState<TimeLapseProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<TimeLapseProject | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<CompiledVideo | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeLapseEngine = new TimeLapseEngine();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = timeLapseEngine.getAllProjects();
    setProjects(allProjects);
    
    // Add some demo projects if none exist
    if (allProjects.length === 0) {
      createDemoProjects();
    }
  };

  const createDemoProjects = () => {
    // Create demo projects
    const demoProject1 = timeLapseEngine.createProject({
      name: 'Blue Dream - Greenhouse A',
      description: '35-day complete grow cycle of Blue Dream strain',
      cropType: 'Cannabis',
      variety: 'Blue Dream',
      expectedDuration: 35,
      facilityId: 'facility_001',
      zoneId: 'greenhouse_a',
      captureInterval: 30, // 30 minutes
      cameraPosition: { x: 0, y: 0, z: 150, angle: 45, zoom: 1 }
    });

    const demoProject2 = timeLapseEngine.createProject({
      name: 'OG Kush - Room B12',
      description: 'High-resolution documentation of OG Kush flowering',
      cropType: 'Cannabis',
      variety: 'OG Kush',
      expectedDuration: 42,
      facilityId: 'facility_001',
      zoneId: 'room_b12',
      captureInterval: 15, // 15 minutes
      cameraPosition: { x: 0, y: 0, z: 120, angle: 30, zoom: 1.5 }
    });

    // Simulate some progress
    demoProject1.capturedFrames = 1680; // 35 days worth
    demoProject1.status = 'completed';
    demoProject1.endDate = new Date();

    demoProject2.capturedFrames = 800; // ~20 days worth
    demoProject2.status = 'active';

    setProjects([demoProject1, demoProject2]);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderProjectsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Time-Lapse Projects</h2>
          <p className="text-gray-600">Automated grow cycle documentation</p>
        </div>
        <button
          onClick={() => setShowCreateProject(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            {/* Project Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-medium">{project.capturedFrames} frames</div>
                <div className="text-xs opacity-80">
                  Day {Math.floor((Date.now() - project.startDate.getTime()) / (24 * 60 * 60 * 1000))} of {project.expectedDuration}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-full ${
                project.status === 'active' ? 'bg-green-500 text-white' :
                project.status === 'completed' ? 'bg-blue-500 text-white' :
                project.status === 'paused' ? 'bg-yellow-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {project.status}
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-black bg-opacity-20">
                <div 
                  className="h-full bg-white bg-opacity-80 transition-all duration-300"
                  style={{ width: `${(project.capturedFrames / project.totalFrames) * 100}%` }}
                />
              </div>
            </div>

            {/* Project Info */}
            <div className="p-4">
              <h3 className="font-semibold mb-1">{project.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                <div>Strain: {project.variety}</div>
                <div>Duration: {project.expectedDuration}d</div>
                <div>Interval: {project.captureInterval}m</div>
                <div>Resolution: {project.captureResolution}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  View
                </button>
                {project.status === 'completed' && (
                  <button className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">
                    <Video className="w-3 h-3" />
                  </button>
                )}
                <button className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Time-Lapse Projects</h3>
          <p className="text-gray-500 mb-6">
            Create your first time-lapse project to start documenting grow cycles
          </p>
          <button
            onClick={() => setShowCreateProject(true)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Create Project
          </button>
        </div>
      )}
    </div>
  );

  const renderVideosTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Compiled Videos</h2>
          <p className="text-gray-600">Generated time-lapse videos and social media clips</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Highlights
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
            <Video className="w-4 h-4" />
            Compile Video
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
          <Instagram className="w-6 h-6 text-pink-500 mb-2" />
          <div className="font-medium">Instagram Reel</div>
          <div className="text-sm text-gray-600">Square/Vertical 15-30s</div>
        </button>
        <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
          <Smartphone className="w-6 h-6 text-purple-500 mb-2" />
          <div className="font-medium">TikTok Clip</div>
          <div className="text-sm text-gray-600">Vertical 15-60s</div>
        </button>
        <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
          <Youtube className="w-6 h-6 text-red-500 mb-2" />
          <div className="font-medium">YouTube Video</div>
          <div className="text-sm text-gray-600">Horizontal 1-10min</div>
        </button>
        <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
          <Monitor className="w-6 h-6 text-blue-500 mb-2" />
          <div className="font-medium">Presentation</div>
          <div className="text-sm text-gray-600">Full HD with overlays</div>
        </button>
      </div>

      {/* Video Library */}
      <div className="bg-white border rounded-lg p-6">
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Compiled Videos Yet</h3>
          <p className="text-gray-500 mb-6">
            Compile your first time-lapse video from captured frames
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 border rounded-lg">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Fast Processing</h4>
              <p className="text-sm text-gray-600">GPU-accelerated compilation</p>
            </div>
            <div className="p-4 border rounded-lg">
              <SquareIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Multiple Formats</h4>
              <p className="text-sm text-gray-600">Social media ready</p>
            </div>
            <div className="p-4 border rounded-lg">
              <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Data Overlays</h4>
              <p className="text-sm text-gray-600">Growth metrics & environment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Growth Analytics</h2>
          <p className="text-gray-600">Data-driven insights from time-lapse captures</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Avg Growth Rate</div>
              <div className="text-2xl font-bold">2.4 cm/day</div>
            </div>
          </div>
          <div className="text-xs text-green-600">↗ 15% vs last grow</div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Cycle Duration</div>
              <div className="text-2xl font-bold">35 days</div>
            </div>
          </div>
          <div className="text-xs text-blue-600">On schedule</div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Health Score</div>
              <div className="text-2xl font-bold">94%</div>
            </div>
          </div>
          <div className="text-xs text-purple-600">Excellent condition</div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Milestones</div>
              <div className="text-2xl font-bold">4/5</div>
            </div>
          </div>
          <div className="text-xs text-orange-600">1 remaining</div>
        </div>
      </div>

      {/* Growth Chart Placeholder */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Growth Progress Over Time</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
            <p>Growth analytics chart would be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Film className="w-8 h-8 text-green-500" />
            Time-Lapse Studio
          </h1>
          <p className="text-gray-600">Document grow cycles with automated time-lapse photography</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            {projects.filter(p => p.status === 'active').length} active projects
          </span>
        </div>
      </div>

      {/* Video Player */}
      {selectedVideo && (
        <div className="bg-black rounded-lg overflow-hidden mb-6">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-96 object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              poster="/api/placeholder/800/450"
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="flex items-center gap-4 text-white">
                <button
                  onClick={handlePlayPause}
                  className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                
                <span className="text-sm">{formatTime(currentTime)}</span>
                
                <div className="flex-1 mx-4">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <span className="text-sm">{formatTime(duration)}</span>
                
                <select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="bg-white bg-opacity-20 rounded px-2 py-1 text-sm"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
                
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'projects', label: 'Projects', icon: Camera },
            { id: 'videos', label: 'Videos', icon: Video },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'projects' && renderProjectsTab()}
      {selectedTab === 'videos' && renderVideosTab()}
      {selectedTab === 'analytics' && renderAnalyticsTab()}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Create Time-Lapse Project</h2>
              <button onClick={() => setShowCreateProject(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g., Blue Dream - Greenhouse A"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Crop Type</label>
                  <select className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="Cannabis">Cannabis</option>
                    <option value="Lettuce">Lettuce</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Herbs">Herbs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Variety/Strain</label>
                  <input
                    type="text"
                    placeholder="e.g., Blue Dream"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Expected Duration (days)</label>
                  <input
                    type="number"
                    placeholder="35"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Capture Interval (minutes)</label>
                  <select className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Camera Settings</label>
                <div className="grid grid-cols-3 gap-4">
                  <select className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="1080p">1080p</option>
                    <option value="4K">4K</option>
                    <option value="8K">8K</option>
                  </select>
                  <select className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="standard">Standard Quality</option>
                    <option value="high">High Quality</option>
                    <option value="ultra">Ultra Quality</option>
                  </select>
                  <select className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="auto">Auto Focus</option>
                    <option value="manual">Manual Focus</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowCreateProject(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Create project logic here
                    setShowCreateProject(false);
                    loadProjects();
                  }}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Start Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                <p className="text-gray-600">{selectedProject.description}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-4">Project Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Frames Captured</span>
                        <span>{selectedProject.capturedFrames} / {selectedProject.totalFrames}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(selectedProject.capturedFrames / selectedProject.totalFrames) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Start Date: {selectedProject.startDate.toLocaleDateString()}</div>
                      <div>Status: <span className="font-medium">{selectedProject.status}</span></div>
                      <div>Capture Interval: {selectedProject.captureInterval} min</div>
                      <div>Resolution: {selectedProject.captureResolution}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                      <Video className="w-4 h-4" />
                      Create Video
                    </button>
                    <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Frames
                    </button>
                    <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}