'use client';

import React, { useState, useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Settings, Save, Download, Upload, Grid, Eye, EyeOff,
  Lock, Unlock, Palette, Layout as LayoutIcon, Play, Pause
} from 'lucide-react';
import { WidgetLibrary } from './WidgetLibrary';
import { WidgetRenderer } from './WidgetRenderer';
import { DataBindingPanel } from './DataBindingPanel';
import { DashboardTemplate } from './DashboardTemplates';
import { DashboardWidget, Dashboard } from './types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardBuilderProps {
  initialDashboard?: {
    id?: string;
    name: string;
    widgets: DashboardWidget[];
    layouts: { [key: string]: Layout[] };
  };
  initialTemplate?: {
    name: string;
    widgets: Omit<DashboardWidget, 'id'>[];
    layouts: { [key: string]: Layout[] };
  };
  onSave?: (dashboard: any) => void;
  readOnly?: boolean;
}

export function DashboardBuilder({ 
  initialDashboard,
  initialTemplate,
  onSave,
  readOnly = false 
}: DashboardBuilderProps) {
  // Initialize from template if provided
  const templateWidgets = initialTemplate?.widgets.map((w, index) => ({
    ...w,
    id: `widget-${index}`
  })) || [];
  
  const templateLayouts = initialTemplate?.layouts || {};
  
  const [widgets, setWidgets] = useState<DashboardWidget[]>(
    initialDashboard?.widgets || templateWidgets
  );
  const [layouts, setLayouts] = useState(
    initialDashboard?.layouts || templateLayouts
  );
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showDataBinding, setShowDataBinding] = useState(false);
  const [editMode, setEditMode] = useState(!readOnly);
  const [liveMode, setLiveMode] = useState(true);
  const [dashboardName, setDashboardName] = useState(
    initialDashboard?.name || initialTemplate?.name || 'New Dashboard'
  );

  const handleAddWidget = useCallback((widgetType: string, config: any) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title: config.title || widgetType,
      dataBindings: [],
      config: config
    };

    setWidgets(prev => [...prev, newWidget]);
    
    // Add layout for the new widget
    setLayouts(prev => {
      const newLayouts = { ...prev };
      const widgetCount = widgets.length;
      const cols = 12;
      const defaultWidth = widgetType === 'trend' || widgetType === 'heatmap' ? 6 : 3;
      const defaultHeight = widgetType === 'trend' || widgetType === 'heatmap' ? 4 : 3;
      
      // Calculate position for new widget
      const x = (widgetCount * defaultWidth) % cols;
      const y = Math.floor((widgetCount * defaultWidth) / cols) * defaultHeight;
      
      // Ensure we have layouts for all breakpoints
      const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];
      breakpoints.forEach(breakpoint => {
        if (!newLayouts[breakpoint]) {
          newLayouts[breakpoint] = [];
        }
        newLayouts[breakpoint].push({
          i: newWidget.id,
          x,
          y,
          w: defaultWidth,
          h: defaultHeight
        });
      });
      
      return newLayouts;
    });
    
    setShowWidgetLibrary(false);
  }, [widgets.length]);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    if (selectedWidget === widgetId) {
      setSelectedWidget(null);
    }
  }, [selectedWidget]);

  const handleUpdateWidget = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    ));
  }, []);

  const handleLayoutChange = useCallback((layout: Layout[], layouts: any) => {
    setLayouts(layouts);
  }, []);

  const handleSaveDashboard = () => {
    const dashboard = {
      id: initialDashboard?.id || `dashboard-${Date.now()}`,
      name: dashboardName,
      widgets,
      layouts,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave?.(dashboard);
    
    // Also save to localStorage for persistence
    let savedDashboards = [];
    try {
      if (typeof window !== 'undefined') {
        savedDashboards = JSON.parse(
          localStorage.getItem('vibelux-dashboards') || '[]'
        );
      }
    } catch (error) {
      console.error('Failed to parse saved dashboards:', error);
      savedDashboards = [];
    }
    const index = savedDashboards.findIndex((d: any) => d.id === dashboard.id);
    if (index >= 0) {
      savedDashboards[index] = dashboard;
    } else {
      savedDashboards.push(dashboard);
    }
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vibelux-dashboards', JSON.stringify(savedDashboards));
      } catch (error) {
        console.error('Failed to save dashboard to localStorage:', error);
      }
    }
  };

  const handleExportDashboard = () => {
    const dashboard = {
      name: dashboardName,
      widgets,
      layouts,
      version: '1.0',
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dashboard, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dashboardName.replace(/\s+/g, '-').toLowerCase()}-dashboard.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportDashboard = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dashboard = JSON.parse(e.target?.result as string);
        setDashboardName(dashboard.name);
        setWidgets(dashboard.widgets);
        setLayouts(dashboard.layouts);
      } catch (error) {
        console.error('Failed to import dashboard:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header Toolbar */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-800 border-b border-gray-700 px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              disabled={!editMode}
              className="text-xl font-semibold bg-transparent text-white outline-none focus:bg-gray-700 px-2 py-1 rounded"
            />
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`p-2 rounded transition-colors ${
                  editMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
              >
                {editMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setLiveMode(!liveMode)}
                className={`p-2 rounded transition-colors ${
                  liveMode 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={liveMode ? 'Live Data' : 'Paused'}
              >
                {liveMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editMode && (
              <>
                <button
                  onClick={() => setShowWidgetLibrary(true)}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Widget
                </button>
                
                <button
                  onClick={handleSaveDashboard}
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  title="Save Dashboard"
                >
                  <Save className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleExportDashboard}
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  title="Export Dashboard"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <label className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportDashboard}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Area */}
      <div className="flex-1 overflow-auto p-4">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          isDraggable={editMode}
          isResizable={editMode}
          compactType="vertical"
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`bg-gray-800 rounded-lg overflow-hidden border-2 transition-all ${
                selectedWidget === widget.id 
                  ? 'border-purple-500' 
                  : 'border-gray-700'
              }`}
              onClick={() => editMode && setSelectedWidget(widget.id)}
            >
              <WidgetRenderer
                widget={widget}
                liveMode={liveMode}
                editMode={editMode}
                onRemove={() => handleRemoveWidget(widget.id)}
                onUpdate={(updates) => handleUpdateWidget(widget.id, updates)}
                onConfigure={() => {
                  setSelectedWidget(widget.id);
                  setShowDataBinding(true);
                }}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Widget Library Modal */}
      <AnimatePresence>
        {showWidgetLibrary && (
          <WidgetLibrary
            onClose={() => setShowWidgetLibrary(false)}
            onAddWidget={handleAddWidget}
          />
        )}
      </AnimatePresence>

      {/* Data Binding Panel */}
      <AnimatePresence>
        {showDataBinding && selectedWidget && (
          <DataBindingPanel
            widget={widgets.find(w => w.id === selectedWidget)!}
            onClose={() => setShowDataBinding(false)}
            onUpdate={(updates) => handleUpdateWidget(selectedWidget, updates)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}