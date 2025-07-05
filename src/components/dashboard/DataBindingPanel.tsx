'use client';

import React, { useState } from 'react';
import { X, Database, Wifi, Server, Calculator, Cable } from 'lucide-react';
import { DashboardWidget } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface DataBindingPanelProps {
  widget: DashboardWidget;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
  onClose: () => void;
}

const dataSourceTypes = [
  { id: 'modbus', name: 'Modbus', icon: Cable, description: 'Modbus registers' },
  { id: 'sensor', name: 'Sensor', icon: Wifi, description: 'IoT sensors' },
  { id: 'database', name: 'Database', icon: Database, description: 'Database queries' },
  { id: 'calculation', name: 'Calculation', icon: Calculator, description: 'Computed values' },
  { id: 'websocket', name: 'WebSocket', icon: Server, description: 'Real-time streams' }
] as const;

export function DataBindingPanel({ widget, onUpdate, onClose }: DataBindingPanelProps) {
  const [bindings, setBindings] = useState(widget.dataBindings || []);
  const [selectedSource, setSelectedSource] = useState<typeof dataSourceTypes[number]['id'] | null>(null);
  const [path, setPath] = useState('');
  const [refreshRate, setRefreshRate] = useState(1000);
  const [transform, setTransform] = useState('');

  const handleAddBinding = () => {
    if (!selectedSource || !path) return;

    const newBinding: DashboardWidget['dataBindings'][0] = {
      source: selectedSource,
      path,
      refreshRate,
      transform: transform || undefined
    };

    const updatedBindings = [...bindings, newBinding];
    setBindings(updatedBindings);
    onUpdate({ dataBindings: updatedBindings });

    // Reset form
    setSelectedSource(null);
    setPath('');
    setRefreshRate(1000);
    setTransform('');
  };

  const handleRemoveBinding = (index: number) => {
    const updatedBindings = bindings.filter((_, i) => i !== index);
    setBindings(updatedBindings);
    onUpdate({ dataBindings: updatedBindings });
  };

  const getPathPlaceholder = () => {
    switch (selectedSource) {
      case 'modbus':
        return 'e.g., holding:1:100 or coil:2:0';
      case 'sensor':
        return 'e.g., zone1/temperature or rack3/ppfd';
      case 'database':
        return 'e.g., sensors.latest.temperature';
      case 'calculation':
        return 'e.g., avg(zone1/temp, zone2/temp)';
      case 'websocket':
        return 'e.g., realtime/sensor/123';
      default:
        return 'Select a data source first';
    }
  };

  const getPathHelp = () => {
    switch (selectedSource) {
      case 'modbus':
        return 'Format: [type]:[slave]:[address] (type: holding/input/coil/discrete)';
      case 'sensor':
        return 'Path to sensor value in the system';
      case 'database':
        return 'Dot notation path to database field';
      case 'calculation':
        return 'Expression with functions and references';
      case 'websocket':
        return 'WebSocket channel or topic path';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Data Bindings - {widget.title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Current Bindings */}
          {bindings.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Current Bindings</h4>
              <div className="space-y-2">
                {bindings.map((binding, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-violet-400">
                          {binding.source}
                        </span>
                        <span className="text-sm text-gray-400">→</span>
                        <span className="text-sm text-white font-mono">
                          {binding.path}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>Refresh: {binding.refreshRate}ms</span>
                        {binding.transform && (
                          <span>Transform: {binding.transform}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveBinding(index)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Binding */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-400">Add New Binding</h4>

            {/* Data Source Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {dataSourceTypes.map((source) => {
                const Icon = source.icon;
                return (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedSource === source.id
                        ? 'bg-violet-600/20 border-violet-600 text-violet-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">{source.name}</div>
                    <div className="text-xs opacity-75">{source.description}</div>
                  </button>
                );
              })}
            </div>

            {selectedSource && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Path Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Data Path
                  </label>
                  <input
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder={getPathPlaceholder()}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-violet-600 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{getPathHelp()}</p>
                </div>

                {/* Refresh Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Refresh Rate (ms)
                  </label>
                  <input
                    type="number"
                    value={refreshRate}
                    onChange={(e) => setRefreshRate(Number(e.target.value))}
                    min={100}
                    max={60000}
                    step={100}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-violet-600 focus:outline-none"
                  />
                </div>

                {/* Transform */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Transform (Optional)
                  </label>
                  <input
                    type="text"
                    value={transform}
                    onChange={(e) => setTransform(e.target.value)}
                    placeholder="e.g., value * 1.8 + 32"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-violet-600 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JavaScript expression to transform the value
                  </p>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddBinding}
                  disabled={!path}
                  className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
                >
                  Add Binding
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}