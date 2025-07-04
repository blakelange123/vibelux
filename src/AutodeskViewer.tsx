'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  Download,
  Maximize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Home,
  Layers,
  Eye,
  EyeOff,
  Settings,
  FileText,
  Box,
  Ruler,
  Info,
  Camera,
  Sun,
  Grid3x3
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface AutodeskViewerProps {
  urn: string; // Autodesk Forge URN for the model
  accessToken?: string; // Access token for Forge API
  onModelLoad?: (viewer: any) => void;
  onSelectionChange?: (selection: any[]) => void;
  className?: string;
  showToolbar?: boolean;
  enableMeasurements?: boolean;
  enableSectioning?: boolean;
}

// Mock Autodesk Viewer API types
interface ViewerOptions {
  env: string;
  api: string;
  getAccessToken: (callback: (token: string, expire: number) => void) => void;
}

interface Viewer3D {
  start: () => Promise<void>;
  loadDocumentNode: (doc: any, viewable: any) => Promise<void>;
  addEventListener: (event: string, callback: Function) => void;
  removeEventListener: (event: string, callback: Function) => void;
  setTheme: (theme: string) => void;
  setQualityLevel: (ambient: boolean, antialiasing: boolean) => void;
  navigation: any;
  impl: any;
  model: any;
  getSelection: () => number[];
  select: (ids: number[]) => void;
  isolate: (ids: number[]) => void;
  hide: (ids: number[]) => void;
  show: (ids: number[]) => void;
  fitToView: (ids?: number[]) => void;
  getProperties: (dbId: number, callback: (props: any) => void) => void;
}

export default function AutodeskViewer({
  urn,
  accessToken = 'demo-token',
  onModelLoad,
  onSelectionChange,
  className = '',
  showToolbar = true,
  enableMeasurements = true,
  enableSectioning = true
}: AutodeskViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewer3DRef = useRef<Viewer3D | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  
  // Viewer state
  const [selectedObjects, setSelectedObjects] = useState<any[]>([]);
  const [modelTree, setModelTree] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState('shaded');
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [sectioningEnabled, setSectioningEnabled] = useState(false);
  const [measurementMode, setMeasurementMode] = useState<'distance' | 'area' | 'angle' | null>(null);

  useEffect(() => {
    // In a real implementation, this would load the Autodesk Viewer SDK
    // For now, we'll simulate it
    const initializeViewer = async () => {
      try {
        setLoading(true);
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In production, you would:
        // 1. Load the Viewer3D script from Autodesk
        // 2. Initialize with your client ID and secret
        // 3. Get access token from your backend
        
        // Mock viewer initialization
        if (viewerRef.current) {
          // Create mock viewer instance
          const mockViewer: Partial<Viewer3D> = {
            start: async () => {
            },
            loadDocumentNode: async (doc: any, viewable: any) => {
            },
            addEventListener: (event: string, callback: Function) => {
            },
            fitToView: () => {
            },
            getSelection: () => selectedObjects.map(obj => obj.dbId),
            select: (ids: number[]) => {
            }
          };
          
          viewer3DRef.current = mockViewer as Viewer3D;
          setViewerReady(true);
          onModelLoad?.(mockViewer);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to initialize Autodesk Viewer');
        setLoading(false);
      }
    };

    initializeViewer();

    return () => {
      // Cleanup viewer
      if (viewer3DRef.current) {
        // viewer3DRef.current.dispose();
      }
    };
  }, [urn]);

  // Mock functions for demo
  const handleZoomIn = () => {
  };

  const handleZoomOut = () => {
  };

  const handleHome = () => {
    viewer3DRef.current?.fitToView();
  };

  const handleRotate = () => {
  };

  const handleMeasure = (mode: 'distance' | 'area' | 'angle') => {
    setMeasurementMode(measurementMode === mode ? null : mode);
  };

  const handleSectioning = () => {
    setSectioningEnabled(!sectioningEnabled);
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    // In real implementation: viewer3DRef.current?.setViewMode(mode);
  };

  const handleExport = (format: string) => {
    // In real implementation: trigger export/download
  };

  const handleScreenshot = () => {
    // In real implementation: viewer3DRef.current?.getScreenShot();
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-900 rounded-lg ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-sm text-gray-400">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className={className}>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {showToolbar && (
        <div className="bg-gray-800 border-b border-gray-700 p-2">
          <div className="flex items-center justify-between">
            {/* Left toolbar */}
            <div className="flex items-center gap-2">
              {/* Navigation tools */}
              <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHome}
                  title="Home view"
                >
                  <Home className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  title="Auto rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>

              {/* View modes */}
              <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleViewModeChange('shaded')}>
                      Shaded
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewModeChange('wireframe')}>
                      Wireframe
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewModeChange('ghosted')}>
                      Ghosted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewModeChange('xray')}>
                      X-Ray
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  className={showGrid ? 'bg-gray-700' : ''}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
              </div>

              {/* Measurement tools */}
              {enableMeasurements && (
                <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMeasure('distance')}
                    className={measurementMode === 'distance' ? 'bg-gray-700' : ''}
                    title="Measure distance"
                  >
                    <Ruler className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMeasure('area')}
                    className={measurementMode === 'area' ? 'bg-gray-700' : ''}
                    title="Measure area"
                  >
                    <Box className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Section tool */}
              {enableSectioning && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSectioning}
                  className={sectioningEnabled ? 'bg-gray-700' : ''}
                  title="Section plane"
                >
                  <Layers className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Right toolbar */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleScreenshot}
                title="Take screenshot"
              >
                <Camera className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('png')}>
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('jpg')}>
                    Export as JPG
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport('obj')}>
                    Export as OBJ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('stl')}>
                    Export as STL
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (viewerRef.current) {
                    viewerRef.current.requestFullscreen();
                  }
                }}
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main viewer container */}
      <div className="relative">
        <div
          ref={viewerRef}
          className="w-full h-[600px] bg-gray-950"
          style={{ cursor: measurementMode ? 'crosshair' : 'default' }}
        >
          {/* Mock 3D view */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Box className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">3D Model View</p>
              <p className="text-sm text-gray-600 mt-2">Autodesk Viewer Integration</p>
            </div>
          </div>

          {/* Mock grid overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
          )}

          {/* Measurement mode indicator */}
          {measurementMode && (
            <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
              {measurementMode === 'distance' && 'Measuring Distance'}
              {measurementMode === 'area' && 'Measuring Area'}
              {measurementMode === 'angle' && 'Measuring Angle'}
              <span className="ml-2 text-xs opacity-75">Click to place points</span>
            </div>
          )}

          {/* Section plane controls */}
          {sectioningEnabled && (
            <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 w-64">
              <h4 className="text-sm font-semibold text-white mb-3">Section Plane</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">X Position</Label>
                  <Slider
                    value={[50]}
                    max={100}
                    step={1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y Position</Label>
                  <Slider
                    value={[50]}
                    max={100}
                    step={1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Z Position</Label>
                  <Slider
                    value={[50]}
                    max={100}
                    step={1}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Properties panel */}
        {selectedObjects.length > 0 && (
          <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 w-72">
            <h4 className="text-sm font-semibold text-white mb-3">
              Properties ({selectedObjects.length} selected)
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-white">Fixture Assembly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white">LED Light Fixture</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Material:</span>
                <span className="text-white">Aluminum</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dimensions:</span>
                <span className="text-white">24" x 48" x 4"</span>
              </div>
              <Separator className="my-2" />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <EyeOff className="w-3 h-3 mr-1" />
                  Hide
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="w-3 h-3 mr-1" />
                  Isolate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>Model: Facility_Layout_v3.rvt</span>
            <span>•</span>
            <span>Objects: 1,247</span>
            <span>•</span>
            <span>Polygons: 2.3M</span>
          </div>
          <div className="flex items-center gap-4">
            <span>FPS: 60</span>
            <span>•</span>
            <span>Render: WebGL</span>
          </div>
        </div>
      </div>
    </div>
  );
}