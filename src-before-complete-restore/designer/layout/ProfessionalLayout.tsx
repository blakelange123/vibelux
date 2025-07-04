'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Maximize2,
  Minimize2,
  X,
  GripVertical
} from 'lucide-react';

interface PanelConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  position: 'left' | 'right' | 'bottom' | 'top';
  collapsible: boolean;
  resizable: boolean;
}

interface ProfessionalLayoutProps {
  children: React.ReactNode;
  leftPanels?: PanelConfig[];
  rightPanels?: PanelConfig[];
  bottomPanels?: PanelConfig[];
  topPanels?: PanelConfig[];
}

export function ProfessionalLayout({
  children,
  leftPanels = [],
  rightPanels = [],
  bottomPanels = [],
  topPanels = []
}: ProfessionalLayoutProps) {
  const [panelStates, setPanelStates] = useState<Record<string, {
    collapsed: boolean;
    width: number;
    height: number;
    minimized: boolean;
  }>>({});

  const [resizing, setResizing] = useState<{
    panelId: string;
    direction: 'width' | 'height';
  } | null>(null);

  const getPanelState = (panelId: string, defaultWidth = 300, defaultHeight = 200) => {
    return panelStates[panelId] || {
      collapsed: false,
      width: defaultWidth,
      height: defaultHeight,
      minimized: false
    };
  };

  const updatePanelState = (panelId: string, updates: Partial<typeof panelStates[string]>) => {
    setPanelStates(prev => ({
      ...prev,
      [panelId]: { ...getPanelState(panelId), ...updates }
    }));
  };

  const toggleCollapse = (panelId: string) => {
    const state = getPanelState(panelId);
    updatePanelState(panelId, { collapsed: !state.collapsed });
  };

  const toggleMinimize = (panelId: string) => {
    const state = getPanelState(panelId);
    updatePanelState(panelId, { minimized: !state.minimized });
  };

  const startResize = (panelId: string, direction: 'width' | 'height') => {
    setResizing({ panelId, direction });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!resizing) return;
    
    const state = getPanelState(resizing.panelId);
    if (resizing.direction === 'width') {
      const newWidth = Math.max(200, Math.min(800, e.clientX));
      updatePanelState(resizing.panelId, { width: newWidth });
    } else {
      const newHeight = Math.max(150, Math.min(600, window.innerHeight - e.clientY));
      updatePanelState(resizing.panelId, { height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setResizing(null);
  };

  React.useEffect(() => {
    if (resizing) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMouseMove(e as any);
      };
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing]);

  const renderPanel = (panel: PanelConfig) => {
    const state = getPanelState(panel.id, panel.defaultWidth, panel.defaultHeight);
    const Component = panel.component;

    if (state.collapsed) {
      return (
        <div
          key={panel.id}
          className={`bg-gray-900 border-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors ${
            panel.position === 'left' || panel.position === 'right' 
              ? 'w-12 border-r border-l' 
              : 'h-12 border-t border-b'
          }`}
          onClick={() => toggleCollapse(panel.id)}
        >
          <div className={`text-xs text-gray-400 font-medium ${
            panel.position === 'left' || panel.position === 'right' 
              ? 'transform -rotate-90 whitespace-nowrap' 
              : ''
          }`}>
            {panel.title}
          </div>
          {panel.position === 'left' && <ChevronRight className="w-4 h-4 text-gray-400" />}
          {panel.position === 'right' && <ChevronLeft className="w-4 h-4 text-gray-400" />}
          {panel.position === 'bottom' && <ChevronUp className="w-4 h-4 text-gray-400" />}
          {panel.position === 'top' && <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      );
    }

    return (
      <div
        key={panel.id}
        className="bg-gray-900 border border-gray-700 flex flex-col"
        style={{
          width: panel.position === 'left' || panel.position === 'right' ? state.width : 'auto',
          height: panel.position === 'top' || panel.position === 'bottom' ? state.height : 'auto',
          minWidth: panel.minWidth || 200,
          minHeight: panel.minHeight || 150
        }}
      >
        {/* Panel Header */}
        <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3">
          <span className="text-sm font-medium text-gray-300">{panel.title}</span>
          <div className="flex items-center gap-1">
            {panel.collapsible && (
              <button
                onClick={() => toggleMinimize(panel.id)}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title={state.minimized ? "Restore" : "Minimize"}
              >
                {state.minimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </button>
            )}
            {panel.collapsible && (
              <button
                onClick={() => toggleCollapse(panel.id)}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Collapse"
              >
                {panel.position === 'left' && <ChevronLeft className="w-3 h-3" />}
                {panel.position === 'right' && <ChevronRight className="w-3 h-3" />}
                {panel.position === 'bottom' && <ChevronDown className="w-3 h-3" />}
                {panel.position === 'top' && <ChevronUp className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Panel Content */}
        {!state.minimized && (
          <div className="flex-1 overflow-hidden relative">
            <Component />
            
            {/* Resize Handle */}
            {panel.resizable && (
              <>
                {(panel.position === 'left' || panel.position === 'right') && (
                  <div
                    className={`absolute top-0 ${panel.position === 'left' ? 'right-0' : 'left-0'} w-1 h-full cursor-ew-resize bg-gray-700 hover:bg-purple-500 transition-colors opacity-0 hover:opacity-100`}
                    onMouseDown={() => startResize(panel.id, 'width')}
                  />
                )}
                {(panel.position === 'top' || panel.position === 'bottom') && (
                  <div
                    className={`absolute left-0 ${panel.position === 'top' ? 'bottom-0' : 'top-0'} w-full h-1 cursor-ns-resize bg-gray-700 hover:bg-purple-500 transition-colors opacity-0 hover:opacity-100`}
                    onMouseDown={() => startResize(panel.id, 'height')}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const leftPanelsWidth = leftPanels.reduce((total, panel) => {
    const state = getPanelState(panel.id, panel.defaultWidth);
    return total + (state.collapsed ? 12 : state.width);
  }, 0);

  const rightPanelsWidth = rightPanels.reduce((total, panel) => {
    const state = getPanelState(panel.id, panel.defaultWidth);
    return total + (state.collapsed ? 12 : state.width);
  }, 0);

  const topPanelsHeight = topPanels.reduce((total, panel) => {
    const state = getPanelState(panel.id, panel.defaultHeight);
    return total + (state.collapsed ? 12 : state.height);
  }, 0);

  const bottomPanelsHeight = bottomPanels.reduce((total, panel) => {
    const state = getPanelState(panel.id, panel.defaultHeight);
    return total + (state.collapsed ? 12 : state.height);
  }, 0);

  return (
    <div className="h-full flex flex-col bg-gray-900 overflow-hidden">
      {/* Top Panels */}
      {topPanels.length > 0 && (
        <div className="flex">
          {topPanels.map(renderPanel)}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-gray-900">
        {/* Left Panels */}
        {leftPanels.length > 0 && (
          <div className="flex">
            {leftPanels.map(renderPanel)}
          </div>
        )}

        {/* Center Content */}
        <div 
          className="flex-1 overflow-hidden bg-gray-800 min-w-0"
          style={{
            marginLeft: leftPanelsWidth ? 0 : 0,
            marginRight: rightPanelsWidth ? 0 : 0,
            marginTop: topPanelsHeight ? 0 : 0,
            marginBottom: bottomPanelsHeight ? 0 : 0
          }}
        >
          {children}
        </div>

        {/* Right Panels */}
        {rightPanels.length > 0 && (
          <div className="flex">
            {rightPanels.map(renderPanel)}
          </div>
        )}
      </div>

      {/* Bottom Panels */}
      {bottomPanels.length > 0 && (
        <div className="flex">
          {bottomPanels.map(renderPanel)}
        </div>
      )}
    </div>
  );
}