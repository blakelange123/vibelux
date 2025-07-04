'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MousePointer, 
  Eye, 
  ArrowDown, 
  Zap, 
  BarChart3, 
  Target,
  Layers,
  Activity,
  Filter,
  Maximize2
} from 'lucide-react';

interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
  type: 'click' | 'hover' | 'scroll' | 'form_interaction';
  timestamp: number;
  elementType?: string;
  elementId?: string;
  duration?: number;
}

interface PageElement {
  id: string;
  type: 'button' | 'link' | 'form' | 'image' | 'text';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  clickCount: number;
  hoverCount: number;
  conversionRate: number;
  avgTimeSpent: number;
}

interface EngagementHeatmapProps {
  className?: string;
  pageUrl?: string;
  timeRange?: '1h' | '24h' | '7d' | '30d';
  heatmapType?: 'click' | 'hover' | 'scroll' | 'all';
}

export default function EngagementHeatmap({
  className = '',
  pageUrl = '/dashboard',
  timeRange = '24h',
  heatmapType = 'click'
}: EngagementHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [pageElements, setPageElements] = useState<PageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<PageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollDepth, setShowScrollDepth] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock page elements for demonstration
  const generateMockElements = (): PageElement[] => {
    return [
      {
        id: 'header-logo',
        type: 'image',
        name: 'VibeLux Logo',
        x: 50,
        y: 20,
        width: 120,
        height: 40,
        clickCount: 45,
        hoverCount: 120,
        conversionRate: 2.3,
        avgTimeSpent: 1.2
      },
      {
        id: 'nav-dashboard',
        type: 'link',
        name: 'Dashboard',
        x: 200,
        y: 25,
        width: 80,
        height: 30,
        clickCount: 234,
        hoverCount: 456,
        conversionRate: 15.6,
        avgTimeSpent: 2.1
      },
      {
        id: 'nav-analytics',
        type: 'link',
        name: 'Analytics',
        x: 300,
        y: 25,
        width: 80,
        height: 30,
        clickCount: 189,
        hoverCount: 367,
        conversionRate: 12.4,
        avgTimeSpent: 1.8
      },
      {
        id: 'cta-upgrade',
        type: 'button',
        name: 'Upgrade Plan',
        x: 450,
        y: 20,
        width: 100,
        height: 40,
        clickCount: 67,
        hoverCount: 234,
        conversionRate: 8.9,
        avgTimeSpent: 3.4
      },
      {
        id: 'search-bar',
        type: 'form',
        name: 'Search',
        x: 600,
        y: 25,
        width: 200,
        height: 30,
        clickCount: 156,
        hoverCount: 289,
        conversionRate: 22.1,
        avgTimeSpent: 4.7
      },
      {
        id: 'main-cta',
        type: 'button',
        name: 'Get Started',
        x: 300,
        y: 200,
        width: 150,
        height: 50,
        clickCount: 178,
        hoverCount: 445,
        conversionRate: 18.3,
        avgTimeSpent: 2.9
      },
      {
        id: 'feature-card-1',
        type: 'button',
        name: 'Feature Card 1',
        x: 100,
        y: 300,
        width: 200,
        height: 150,
        clickCount: 89,
        hoverCount: 234,
        conversionRate: 11.2,
        avgTimeSpent: 5.1
      },
      {
        id: 'feature-card-2',
        type: 'button',
        name: 'Feature Card 2',
        x: 350,
        y: 300,
        width: 200,
        height: 150,
        clickCount: 123,
        hoverCount: 298,
        conversionRate: 14.7,
        avgTimeSpent: 4.8
      },
      {
        id: 'feature-card-3',
        type: 'button',
        name: 'Feature Card 3',
        x: 600,
        y: 300,
        width: 200,
        height: 150,
        clickCount: 76,
        hoverCount: 189,
        conversionRate: 9.4,
        avgTimeSpent: 3.6
      },
      {
        id: 'footer-contact',
        type: 'link',
        name: 'Contact Us',
        x: 200,
        y: 600,
        width: 100,
        height: 30,
        clickCount: 34,
        hoverCount: 87,
        conversionRate: 7.8,
        avgTimeSpent: 1.5
      }
    ];
  };

  // Generate mock heatmap data
  const generateMockHeatmapData = (): HeatmapData[] => {
    const data: HeatmapData[] = [];
    const elements = generateMockElements();

    elements.forEach(element => {
      // Generate clicks around each element
      for (let i = 0; i < element.clickCount; i++) {
        data.push({
          x: element.x + Math.random() * element.width,
          y: element.y + Math.random() * element.height,
          intensity: Math.random() * 0.8 + 0.2,
          type: 'click',
          timestamp: Date.now() - Math.random() * 86400000,
          elementType: element.type,
          elementId: element.id
        });
      }

      // Generate hovers around each element
      for (let i = 0; i < Math.floor(element.hoverCount / 3); i++) {
        data.push({
          x: element.x + Math.random() * element.width,
          y: element.y + Math.random() * element.height,
          intensity: Math.random() * 0.6 + 0.1,
          type: 'hover',
          timestamp: Date.now() - Math.random() * 86400000,
          elementType: element.type,
          elementId: element.id,
          duration: Math.random() * 5000 + 500
        });
      }
    });

    // Add some random scroll interactions
    for (let i = 0; i < 50; i++) {
      data.push({
        x: Math.random() * 900,
        y: Math.random() * 700,
        intensity: Math.random() * 0.4 + 0.1,
        type: 'scroll',
        timestamp: Date.now() - Math.random() * 86400000
      });
    }

    return data;
  };

  useEffect(() => {
    const loadData = () => {
      const elements = generateMockElements();
      const heatmap = generateMockHeatmapData();
      
      setPageElements(elements);
      setHeatmapData(heatmap);
      setIsLoading(false);
    };

    loadData();
  }, [pageUrl, timeRange, heatmapType]);

  // Draw heatmap on canvas
  useEffect(() => {
    if (!canvasRef.current || heatmapData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter data based on heatmap type
    const filteredData = heatmapType === 'all' 
      ? heatmapData 
      : heatmapData.filter(point => point.type === heatmapType);

    // Draw heatmap points
    filteredData.forEach(point => {
      const radius = 20;
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      
      // Color based on type and intensity
      let baseColor = '';
      switch (point.type) {
        case 'click':
          baseColor = '255, 99, 132'; // Red
          break;
        case 'hover':
          baseColor = '54, 162, 235'; // Blue
          break;
        case 'scroll':
          baseColor = '75, 192, 192'; // Teal
          break;
        default:
          baseColor = '153, 102, 255'; // Purple
      }

      gradient.addColorStop(0, `rgba(${baseColor}, ${point.intensity * 0.8})`);
      gradient.addColorStop(0.5, `rgba(${baseColor}, ${point.intensity * 0.4})`);
      gradient.addColorStop(1, `rgba(${baseColor}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [heatmapData, heatmapType]);

  const getElementTypeIcon = (type: string) => {
    switch (type) {
      case 'button': return <Target className="w-4 h-4" />;
      case 'link': return <MousePointer className="w-4 h-4" />;
      case 'form': return <Layers className="w-4 h-4" />;
      case 'image': return <Eye className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'click': return 'text-red-400 bg-red-400/10';
      case 'hover': return 'text-blue-400 bg-blue-400/10';
      case 'scroll': return 'text-teal-400 bg-teal-400/10';
      case 'form_interaction': return 'text-green-400 bg-green-400/10';
      default: return 'text-purple-400 bg-purple-400/10';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
            <span className="text-gray-300">Loading heatmap data...</span>
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
            <Zap className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Engagement Heatmap</h2>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={heatmapType}
              onChange={(e) => setHeatmapType(e.target.value as any)}
              className="px-3 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
            >
              <option value="all">All Interactions</option>
              <option value="click">Clicks Only</option>
              <option value="hover">Hovers Only</option>
              <option value="scroll">Scroll Events</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={() => setShowScrollDepth(!showScrollDepth)}
              className={`px-3 py-1 rounded text-sm ${
                showScrollDepth ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Scroll Depth
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">Clicks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300">Hovers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
            <span className="text-gray-300">Scroll Events</span>
          </div>
          <div className="text-gray-400">• Intensity = Interaction Frequency</div>
        </div>
      </div>

      <div className="flex">
        {/* Heatmap Visualization */}
        <div className="flex-1 p-6">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            {/* Page Mockup Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900">
              {/* Header */}
              <div className="h-16 bg-gray-700 border-b border-gray-600 flex items-center px-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-8 bg-purple-600 rounded"></div>
                  <div className="flex gap-4">
                    <div className="w-16 h-6 bg-gray-600 rounded"></div>
                    <div className="w-16 h-6 bg-gray-600 rounded"></div>
                    <div className="w-16 h-6 bg-gray-600 rounded"></div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <div className="w-20 h-8 bg-green-600 rounded"></div>
                    <div className="w-32 h-6 bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-64 h-12 bg-purple-600 rounded mx-auto mb-4"></div>
                  <div className="w-96 h-4 bg-gray-600 rounded mx-auto"></div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="h-32 bg-gray-700 rounded"></div>
                  <div className="h-32 bg-gray-700 rounded"></div>
                  <div className="h-32 bg-gray-700 rounded"></div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="w-full h-4 bg-gray-600 rounded"></div>
                    <div className="w-3/4 h-4 bg-gray-600 rounded"></div>
                    <div className="w-full h-4 bg-gray-600 rounded"></div>
                  </div>
                  <div className="h-40 bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-700 border-t border-gray-600 flex items-center justify-center">
                <div className="flex gap-4">
                  <div className="w-20 h-6 bg-gray-600 rounded"></div>
                  <div className="w-20 h-6 bg-gray-600 rounded"></div>
                  <div className="w-20 h-6 bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>

            {/* Heatmap Canvas */}
            <canvas
              ref={canvasRef}
              width={900}
              height={600}
              className="absolute inset-0 pointer-events-none"
              style={{ mixBlendMode: 'overlay' }}
            />

            {/* Interactive Element Overlays */}
            {pageElements.map((element) => (
              <div
                key={element.id}
                className="absolute border-2 border-transparent hover:border-purple-400 cursor-pointer transition-colors"
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`
                }}
                onClick={() => setSelectedElement(element)}
                title={element.name}
              >
                {/* Element overlay with opacity */}
                <div className="w-full h-full bg-purple-500 opacity-0 hover:opacity-20 transition-opacity rounded"></div>
              </div>
            ))}

            {/* Scroll Depth Indicator */}
            {showScrollDepth && (
              <div className="absolute right-4 top-0 bottom-0 w-2 bg-gray-700 rounded">
                <div 
                  className="bg-gradient-to-b from-green-500 to-red-500 w-full rounded"
                  style={{ height: '75%' }}
                ></div>
                <div className="absolute -right-8 top-0 text-xs text-gray-400">100%</div>
                <div className="absolute -right-8 top-1/4 text-xs text-gray-400">75%</div>
                <div className="absolute -right-8 top-1/2 text-xs text-gray-400">50%</div>
                <div className="absolute -right-8 top-3/4 text-xs text-gray-400">25%</div>
                <div className="absolute -right-6 bottom-0 text-xs text-gray-400">0%</div>
              </div>
            )}
          </div>
        </div>

        {/* Element Details Panel */}
        {selectedElement && (
          <div className="w-80 border-l border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Element Analytics</h3>
              <button
                onClick={() => setSelectedElement(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getElementTypeIcon(selectedElement.type)}
                  <span className="font-medium text-white">{selectedElement.name}</span>
                </div>
                <p className="text-sm text-gray-400">Type: {selectedElement.type}</p>
                <p className="text-sm text-gray-400">ID: {selectedElement.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MousePointer className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-gray-400">Clicks</span>
                  </div>
                  <p className="text-lg font-bold text-white">{selectedElement.clickCount}</p>
                </div>

                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-400">Hovers</span>
                  </div>
                  <p className="text-lg font-bold text-white">{selectedElement.hoverCount}</p>
                </div>

                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-gray-400">Conversion</span>
                  </div>
                  <p className="text-lg font-bold text-white">{selectedElement.conversionRate}%</p>
                </div>

                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-400">Avg Time</span>
                  </div>
                  <p className="text-lg font-bold text-white">{selectedElement.avgTimeSpent}s</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Performance Score</h4>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(selectedElement.conversionRate * 5, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Based on conversion rate and engagement
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations</h4>
                <div className="space-y-2">
                  {selectedElement.conversionRate < 10 && (
                    <div className="text-xs text-yellow-400 bg-yellow-400/10 p-2 rounded">
                      • Consider improving call-to-action text
                    </div>
                  )}
                  {selectedElement.hoverCount > selectedElement.clickCount * 3 && (
                    <div className="text-xs text-blue-400 bg-blue-400/10 p-2 rounded">
                      • High interest but low clicks - check accessibility
                    </div>
                  )}
                  {selectedElement.avgTimeSpent < 2 && (
                    <div className="text-xs text-red-400 bg-red-400/10 p-2 rounded">
                      • Users spend little time here - consider repositioning
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="p-6 border-t border-gray-700">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {heatmapData.filter(d => d.type === 'click').length}
            </div>
            <div className="text-sm text-gray-400">Total Clicks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {heatmapData.filter(d => d.type === 'hover').length}
            </div>
            <div className="text-sm text-gray-400">Hover Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {Math.round(pageElements.reduce((sum, el) => sum + el.conversionRate, 0) / pageElements.length)}%
            </div>
            <div className="text-sm text-gray-400">Avg Conversion</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {Math.round(pageElements.reduce((sum, el) => sum + el.avgTimeSpent, 0) / pageElements.length * 10) / 10}s
            </div>
            <div className="text-sm text-gray-400">Avg Engagement</div>
          </div>
        </div>
      </div>
    </div>
  );
}