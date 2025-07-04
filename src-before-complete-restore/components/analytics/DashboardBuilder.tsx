'use client';

import React, { useState, useEffect } from 'react';
import { 
  Grid3x3, 
  Plus, 
  Save, 
  X, 
  Move, 
  Settings,
  BarChart3,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Globe,
  Eye,
  Bell,
  Layers,
  Lock,
  Unlock,
  Download,
  Upload,
  Copy,
  Trash2
} from 'lucide-react';

interface Widget {
  id: string;
  type: 'chart' | 'metric' | 'map' | 'list' | 'heatmap' | 'funnel' | 'alerts';
  title: string;
  component: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  config: any;
  locked?: boolean;
}

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  layout: 'grid' | 'freeform';
  gridCols: number;
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
}

interface DashboardBuilderProps {
  className?: string;
  onSave?: (dashboard: Dashboard) => void;
  initialDashboard?: Dashboard;
}

const WIDGET_TYPES = [
  { id: 'revenue-chart', type: 'chart', title: 'Revenue Chart', icon: DollarSign, component: 'RevenueChart', defaultSize: 'medium' },
  { id: 'user-growth', type: 'chart', title: 'User Growth', icon: Users, component: 'UserGrowthChart', defaultSize: 'medium' },
  { id: 'active-users', type: 'metric', title: 'Active Users', icon: Activity, component: 'ActiveUsersMetric', defaultSize: 'small' },
  { id: 'conversion-rate', type: 'metric', title: 'Conversion Rate', icon: TrendingUp, component: 'ConversionMetric', defaultSize: 'small' },
  { id: 'user-map', type: 'map', title: 'User Map', icon: Globe, component: 'RealTimeUserMap', defaultSize: 'large' },
  { id: 'user-journey', type: 'list', title: 'User Journeys', icon: Eye, component: 'LiveUserJourney', defaultSize: 'medium' },
  { id: 'alerts', type: 'alerts', title: 'Smart Alerts', icon: Bell, component: 'SmartAlertSystem', defaultSize: 'medium' },
  { id: 'engagement-heatmap', type: 'heatmap', title: 'Engagement Heatmap', icon: Activity, component: 'EngagementHeatmap', defaultSize: 'large' },
  { id: 'conversion-funnel', type: 'funnel', title: 'Conversion Funnel', icon: BarChart3, component: 'ConversionFunnel', defaultSize: 'medium' }
];

export default function DashboardBuilder({
  className = '',
  onSave,
  initialDashboard
}: DashboardBuilderProps) {
  const [dashboard, setDashboard] = useState<Dashboard>(initialDashboard || {
    id: `dashboard-${Date.now()}`,
    name: 'New Dashboard',
    description: '',
    widgets: [],
    layout: 'grid',
    gridCols: 12,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  const [isEditing, setIsEditing] = useState(true);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [savedDashboards, setSavedDashboards] = useState<Dashboard[]>([]);

  useEffect(() => {
    // Load saved dashboards from localStorage
    const saved = localStorage.getItem('vibelux-dashboards');
    if (saved) {
      setSavedDashboards(JSON.parse(saved));
    }
  }, []);

  const addWidget = (widgetType: typeof WIDGET_TYPES[0]) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType.type as Widget['type'],
      title: widgetType.title,
      component: widgetType.component,
      size: widgetType.defaultSize as Widget['size'],
      position: { x: 0, y: 0 },
      config: {},
      locked: false
    };

    setDashboard(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      updatedAt: Date.now()
    }));

    setShowWidgetPicker(false);
    setSelectedWidget(newWidget);
  };

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, ...updates } : w
      ),
      updatedAt: Date.now()
    }));
  };

  const removeWidget = (widgetId: string) => {
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId),
      updatedAt: Date.now()
    }));
    setSelectedWidget(null);
  };

  const saveDashboard = () => {
    const dashboards = [...savedDashboards.filter(d => d.id !== dashboard.id), dashboard];
    localStorage.setItem('vibelux-dashboards', JSON.stringify(dashboards));
    setSavedDashboards(dashboards);
    
    if (onSave) {
      onSave(dashboard);
    }
    
    alert('Dashboard saved successfully!');
  };

  const loadDashboard = (dashboardId: string) => {
    const toLoad = savedDashboards.find(d => d.id === dashboardId);
    if (toLoad) {
      setDashboard(toLoad);
    }
  };

  const deleteDashboard = (dashboardId: string) => {
    const dashboards = savedDashboards.filter(d => d.id !== dashboardId);
    localStorage.setItem('vibelux-dashboards', JSON.stringify(dashboards));
    setSavedDashboards(dashboards);
  };

  const exportDashboard = () => {
    const dataStr = JSON.stringify(dashboard, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${dashboard.name.replace(/\s+/g, '-').toLowerCase()}-dashboard.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importDashboard = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setDashboard({
            ...imported,
            id: `dashboard-${Date.now()}`, // Generate new ID
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
        } catch (error) {
          alert('Invalid dashboard file');
        }
      };
      reader.readAsText(file);
    }
  };

  const getWidgetStyle = (widget: Widget) => {
    const sizeMap = {
      small: { width: 3, height: 2 },
      medium: { width: 6, height: 3 },
      large: { width: 9, height: 4 },
      full: { width: 12, height: 4 }
    };

    const size = sizeMap[widget.size];
    
    if (dashboard.layout === 'grid') {
      return {
        gridColumn: `span ${size.width}`,
        gridRow: `span ${size.height}`
      };
    }
    
    return {
      position: 'absolute' as const,
      left: `${widget.position.x}px`,
      top: `${widget.position.y}px`,
      width: `${size.width * 80}px`,
      height: `${size.height * 80}px`
    };
  };

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Grid3x3 className="w-6 h-6 text-purple-400" />
            <input
              type="text"
              value={dashboard.name}
              onChange={(e) => setDashboard(prev => ({ ...prev, name: e.target.value }))}
              className="text-xl font-semibold bg-transparent text-white border-b border-gray-600 focus:border-purple-400 outline-none"
              disabled={!isEditing}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1 rounded text-sm ${
                previewMode ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2 rounded ${
                isEditing ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {isEditing ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
            
            <button
              onClick={saveDashboard}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            
            <div className="relative group">
              <button className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded">
                <Settings className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={exportDashboard}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-t-lg"
                >
                  <Download className="w-4 h-4" />
                  Export Dashboard
                </button>
                <label className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Dashboard
                  <input
                    type="file"
                    accept=".json"
                    onChange={importDashboard}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setDashboard(prev => ({ ...prev, layout: prev.layout === 'grid' ? 'freeform' : 'grid' }))}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Layers className="w-4 h-4" />
                  Layout: {dashboard.layout}
                </button>
                <button
                  onClick={() => {
                    const newDashboard = { ...dashboard, id: `dashboard-${Date.now()}`, name: `${dashboard.name} Copy` };
                    setDashboard(newDashboard);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-b-lg"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard description */}
        <input
          type="text"
          placeholder="Add a description..."
          value={dashboard.description}
          onChange={(e) => setDashboard(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-gray-300"
          disabled={!isEditing}
        />
      </div>

      {/* Dashboard Canvas */}
      <div className="p-6">
        <div 
          className={`relative min-h-[500px] ${
            dashboard.layout === 'grid' 
              ? 'grid gap-4' 
              : ''
          }`}
          style={dashboard.layout === 'grid' ? {
            gridTemplateColumns: `repeat(${dashboard.gridCols}, 1fr)`
          } : {}}
        >
          {dashboard.widgets.map(widget => (
            <div
              key={widget.id}
              className={`bg-gray-900 rounded-lg p-4 border-2 transition-all cursor-pointer ${
                selectedWidget?.id === widget.id
                  ? 'border-purple-500'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              style={getWidgetStyle(widget)}
              onClick={() => setSelectedWidget(widget)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">{widget.title}</h3>
                {isEditing && !widget.locked && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateWidget(widget.id, { locked: true });
                      }}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <Unlock className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWidget(widget.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {widget.locked && (
                  <Lock className="w-3 h-3 text-gray-500" />
                )}
              </div>
              
              {/* Widget preview */}
              <div className="flex items-center justify-center h-32 text-gray-500">
                {React.createElement(
                  WIDGET_TYPES.find(w => w.component === widget.component)?.icon || Activity,
                  { className: "w-12 h-12 opacity-50" }
                )}
                <span className="ml-3 text-sm">{widget.component}</span>
              </div>
            </div>
          ))}
          
          {/* Add Widget Button */}
          {isEditing && (
            <button
              onClick={() => setShowWidgetPicker(true)}
              className="bg-gray-900 rounded-lg p-4 border-2 border-dashed border-gray-700 hover:border-purple-500 transition-all flex items-center justify-center min-h-[160px]"
              style={dashboard.layout === 'grid' ? {
                gridColumn: 'span 3',
                gridRow: 'span 2'
              } : {}}
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <span className="text-sm text-gray-400">Add Widget</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Widget Picker Modal */}
      {showWidgetPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl mx-4 border border-gray-700 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add Widget</h3>
              <button
                onClick={() => setShowWidgetPicker(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {WIDGET_TYPES.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => addWidget(widget)}
                  className="p-4 bg-gray-900 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-lg transition-all text-left"
                >
                  <widget.icon className="w-8 h-8 text-purple-400 mb-3" />
                  <h4 className="text-sm font-medium text-white mb-1">{widget.title}</h4>
                  <p className="text-xs text-gray-400">Type: {widget.type}</p>
                  <p className="text-xs text-gray-400">Size: {widget.defaultSize}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Widget Settings Panel */}
      {selectedWidget && isEditing && (
        <div className="absolute right-0 top-0 w-80 h-full bg-gray-900 border-l border-gray-700 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Widget Settings</h3>
            <button
              onClick={() => setSelectedWidget(null)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title</label>
              <input
                type="text"
                value={selectedWidget.title}
                onChange={(e) => updateWidget(selectedWidget.id, { title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Size</label>
              <select
                value={selectedWidget.size}
                onChange={(e) => updateWidget(selectedWidget.id, { size: e.target.value as Widget['size'] })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="full">Full Width</option>
              </select>
            </div>
            
            {dashboard.layout === 'freeform' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Position X</label>
                  <input
                    type="number"
                    value={selectedWidget.position.x}
                    onChange={(e) => updateWidget(selectedWidget.id, { 
                      position: { ...selectedWidget.position, x: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Position Y</label>
                  <input
                    type="number"
                    value={selectedWidget.position.y}
                    onChange={(e) => updateWidget(selectedWidget.id, { 
                      position: { ...selectedWidget.position, y: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                  />
                </div>
              </>
            )}
            
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={() => removeWidget(selectedWidget.id)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Widget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Dashboards */}
      {savedDashboards.length > 0 && (
        <div className="p-6 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Saved Dashboards</h3>
          <div className="grid grid-cols-4 gap-3">
            {savedDashboards.map(saved => (
              <div
                key={saved.id}
                className={`p-3 bg-gray-900 rounded-lg border cursor-pointer transition-all ${
                  saved.id === dashboard.id ? 'border-purple-500' : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => loadDashboard(saved.id)}
              >
                <h4 className="text-sm font-medium text-white mb-1">{saved.name}</h4>
                <p className="text-xs text-gray-400">{saved.widgets.length} widgets</p>
                {saved.isDefault && (
                  <span className="inline-block mt-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}