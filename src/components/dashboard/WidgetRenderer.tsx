'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Settings, AlertCircle } from 'lucide-react';
import { DashboardWidget } from './types';
import { GaugeWidget } from './widgets/GaugeWidget';
import { NumericWidget } from './widgets/NumericWidget';
import { TrendWidget } from './widgets/TrendWidget';
import { ToggleWidget } from './widgets/ToggleWidget';
import { SliderWidget } from './widgets/SliderWidget';
import { StatusWidget } from './widgets/StatusWidget';
import { AlarmWidget } from './widgets/AlarmWidget';
import { HeatmapWidget } from './widgets/HeatmapWidget';
import { CameraWidget } from './widgets/CameraWidget';
import { useDataBinding } from '@/hooks/useDataBinding';
import { DataBindingPanel } from './DataBindingPanel';

interface WidgetRendererProps {
  widget: DashboardWidget;
  liveMode: boolean;
  editMode: boolean;
  onRemove: () => void;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
  onConfigure: () => void;
}

export function WidgetRenderer({
  widget,
  liveMode,
  editMode,
  onRemove,
  onUpdate,
  onConfigure
}: WidgetRendererProps) {
  const [error, setError] = useState<string | null>(null);
  const { data, loading, error: bindingError } = useDataBinding(
    widget,
    liveMode
  );

  useEffect(() => {
    if (bindingError) {
      setError(bindingError.message);
    }
  }, [bindingError]);

  const renderWidget = () => {
    const props = {
      config: widget.config,
      data: data,
      loading: loading,
      onUpdate: (value: any) => {
        // Handle control widget updates
        if (widget.dataBindings[0]) {
          // Send update back to data source
        }
      }
    };

    switch (widget.type) {
      case 'gauge':
        return <GaugeWidget {...props} />;
      case 'numeric':
        return <NumericWidget {...props} />;
      case 'trend':
        return <TrendWidget {...props} />;
      case 'toggle':
        return <ToggleWidget {...props} />;
      case 'slider':
        return <SliderWidget {...props} />;
      case 'status':
        return <StatusWidget {...props} />;
      case 'alarm':
        return <AlarmWidget {...props} />;
      case 'heatmap':
        return <HeatmapWidget {...props} />;
      case 'camera':
        return <CameraWidget {...props} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Widget type "{widget.type}" not implemented
          </div>
        );
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Widget Header */}
      <div className="bg-gray-900/50 px-3 py-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-200 truncate">
          {widget.title}
        </h3>
        {editMode && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfigure();
              }}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Configure"
            >
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 hover:bg-red-600 rounded transition-colors"
              title="Remove"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Widget Content */}
      <div className="flex-1 p-3 overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm text-center">{error}</p>
          </div>
        ) : (
          renderWidget()
        )}
      </div>

      {/* Live Data Indicator */}
      {liveMode && !error && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full"
        />
      )}
    </div>
  );
}