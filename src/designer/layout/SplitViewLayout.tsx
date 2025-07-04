'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Grid3x3, 
  Layers, 
  Move, 
  Eye, 
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Building
} from 'lucide-react';
import { SimpleCanvas2D } from '../canvas/SimpleCanvas2D';
import { Enhanced3DCanvas } from '../canvas/Enhanced3DCanvas';
import { useDesigner } from '../context/DesignerContext';

export type ViewLayout = 'single-2d' | 'single-3d' | 'split-horizontal' | 'split-vertical' | 'quad';
export type ViewType = '2d' | '3d-perspective' | '3d-top' | '3d-front' | '3d-side';

interface ViewPort {
  id: string;
  type: ViewType;
  title: string;
  maximized?: boolean;
}

interface SplitViewLayoutProps {
  children?: React.ReactNode;
  defaultLayout?: ViewLayout;
  onLayoutChange?: (layout: ViewLayout) => void;
}

export function SplitViewLayout({ 
  children, 
  defaultLayout = 'single-2d',
  onLayoutChange 
}: SplitViewLayoutProps) {
  const { state, dispatch } = useDesigner();
  const [layout, setLayout] = useState<ViewLayout>(defaultLayout);
  const [viewPorts, setViewPorts] = useState<ViewPort[]>([
    { id: 'main-2d', type: '2d', title: 'Top View (2D)' },
    { id: 'main-3d', type: '3d-perspective', title: 'Perspective (3D)' }
  ]);
  
  const [splitPosition, setSplitPosition] = useState(50); // percentage
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle layout change
  const handleLayoutChange = useCallback((newLayout: ViewLayout) => {
    setLayout(newLayout);
    
    // Update viewports based on layout
    switch (newLayout) {
      case 'single-2d':
        setViewPorts([{ id: 'main-2d', type: '2d', title: 'Top View (2D)' }]);
        break;
      case 'single-3d':
        setViewPorts([{ id: 'main-3d', type: '3d-perspective', title: 'Perspective (3D)' }]);
        break;
      case 'split-horizontal':
      case 'split-vertical':
        setViewPorts([
          { id: 'main-2d', type: '2d', title: 'Top View (2D)' },
          { id: 'main-3d', type: '3d-perspective', title: 'Perspective (3D)' }
        ]);
        break;
      case 'quad':
        setViewPorts([
          { id: 'quad-2d', type: '2d', title: 'Top View (2D)' },
          { id: 'quad-3d-perspective', type: '3d-perspective', title: 'Perspective (3D)' },
          { id: 'quad-3d-front', type: '3d-front', title: 'Front View (3D)' },
          { id: 'quad-3d-side', type: '3d-side', title: 'Side View (3D)' }
        ]);
        break;
    }
    
    onLayoutChange?.(newLayout);
  }, [onLayoutChange]);

  // Handle splitter drag
  const handleSplitterMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingSplitter || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let newPosition: number;

    if (layout === 'split-horizontal') {
      newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    } else {
      newPosition = ((e.clientY - rect.top) / rect.height) * 100;
    }

    setSplitPosition(Math.max(20, Math.min(80, newPosition)));
  }, [isDraggingSplitter, layout]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingSplitter(false);
  }, []);

  // Set up global mouse event listeners
  React.useEffect(() => {
    if (isDraggingSplitter) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = layout === 'split-horizontal' ? 'col-resize' : 'row-resize';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
      };
    }
  }, [isDraggingSplitter, handleMouseMove, handleMouseUp, layout]);

  // Render viewport content
  const renderViewport = (viewport: ViewPort) => {
    if (viewport.type === '2d') {
      return <SimpleCanvas2D />;
    } else {
      const view3DType = viewport.type.replace('3d-', '') as 'perspective' | 'top' | 'front' | 'side';
      return <Enhanced3DCanvas viewType={view3DType} syncWith2D={true} />;
    }
  };

  // Render layout
  const renderLayout = () => {
    switch (layout) {
      case 'single-2d':
      case 'single-3d':
        return (
          <div className="relative w-full h-full">
            <ViewPortContainer viewport={viewPorts[0]}>
              {renderViewport(viewPorts[0])}
            </ViewPortContainer>
          </div>
        );

      case 'split-horizontal':
        return (
          <div className="relative w-full h-full flex">
            <div style={{ width: `${splitPosition}%` }} className="h-full">
              <ViewPortContainer viewport={viewPorts[0]}>
                {renderViewport(viewPorts[0])}
              </ViewPortContainer>
            </div>
            
            <div
              className="w-1 bg-gray-700 hover:bg-purple-600 transition-colors cursor-col-resize relative group"
              onMouseDown={handleSplitterMouseDown}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft className="w-3 h-3 text-gray-400" />
                <ChevronRight className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            
            <div style={{ width: `${100 - splitPosition}%` }} className="h-full">
              <ViewPortContainer viewport={viewPorts[1]}>
                {renderViewport(viewPorts[1])}
              </ViewPortContainer>
            </div>
          </div>
        );

      case 'split-vertical':
        return (
          <div className="relative w-full h-full flex flex-col">
            <div style={{ height: `${splitPosition}%` }} className="w-full">
              <ViewPortContainer viewport={viewPorts[0]}>
                {renderViewport(viewPorts[0])}
              </ViewPortContainer>
            </div>
            
            <div
              className="h-1 bg-gray-700 hover:bg-purple-600 transition-colors cursor-row-resize relative group"
              onMouseDown={handleSplitterMouseDown}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronUp className="w-3 h-3 text-gray-400" />
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            
            <div style={{ height: `${100 - splitPosition}%` }} className="w-full">
              <ViewPortContainer viewport={viewPorts[1]}>
                {renderViewport(viewPorts[1])}
              </ViewPortContainer>
            </div>
          </div>
        );

      case 'quad':
        return (
          <div className="relative w-full h-full grid grid-cols-2 grid-rows-2 gap-1 bg-gray-800">
            {viewPorts.map((viewport) => (
              <ViewPortContainer key={viewport.id} viewport={viewport}>
                {renderViewport(viewport)}
              </ViewPortContainer>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-950">
      {/* Debug - Remove this after testing */}
      {/* <div className="absolute top-0 left-0 bg-red-500 text-white p-2 z-50">
        SplitViewLayout Loaded - Layout: {layout}
      </div> */}
      
      {/* Layout Controls */}
      <div className="absolute top-4 left-4 z-40 flex gap-2">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 flex gap-1 shadow-lg">
          <button
            onClick={() => handleLayoutChange('single-2d')}
            className={`p-2 rounded transition-colors ${
              layout === 'single-2d' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="2D View Only"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleLayoutChange('single-3d')}
            className={`p-2 rounded transition-colors ${
              layout === 'single-3d' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="3D View Only"
          >
            <Eye className="w-4 h-4" />
          </button>
          <div className="w-px bg-gray-700 mx-1" />
          <button
            onClick={() => handleLayoutChange('split-horizontal')}
            className={`p-2 rounded transition-colors ${
              layout === 'split-horizontal' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Split Horizontal"
          >
            <div className="w-4 h-4 border border-current rounded grid grid-cols-2 gap-px">
              <div className="bg-current"></div>
              <div className="bg-current"></div>
            </div>
          </button>
          <button
            onClick={() => handleLayoutChange('split-vertical')}
            className={`p-2 rounded transition-colors ${
              layout === 'split-vertical' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Split Vertical"
          >
            <div className="w-4 h-4 border border-current rounded grid grid-rows-2 gap-px">
              <div className="bg-current"></div>
              <div className="bg-current"></div>
            </div>
          </button>
          <button
            onClick={() => handleLayoutChange('quad')}
            className={`p-2 rounded transition-colors ${
              layout === 'quad' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Quad View"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Layout Container */}
      <div ref={containerRef} className="w-full h-full">
        {renderLayout()}
      </div>
    </div>
  );
}

// Viewport Container Component
interface ViewPortContainerProps {
  viewport: ViewPort;
  children: React.ReactNode;
}

function ViewPortContainer({ viewport, children }: ViewPortContainerProps) {
  const { state } = useDesigner();
  const { room } = state;
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Check if greenhouse mode is active
  const isGreenhouse = room && (room.height > 8 || room.width > 20 || room.length > 30);
  const is3DView = viewport.type.startsWith('3d');

  return (
    <div className="relative w-full h-full border border-gray-800">
      {/* Viewport Header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 px-3 py-1 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-300">{viewport.title}</span>
          {isGreenhouse && is3DView && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-900/50 border border-green-700 rounded-full">
              <Building className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">Greenhouse Mode</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>
      
      {/* Viewport Content */}
      <div className="w-full h-full pt-7 overflow-auto">
        {children}
      </div>
    </div>
  );
}