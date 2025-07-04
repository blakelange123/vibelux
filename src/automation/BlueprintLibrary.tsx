'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Star,
  Clock,
  Filter,
  Search,
  Download,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  Zap,
  Plus,
  Play,
  Eye,
  Copy
} from 'lucide-react';
import { BlueprintTemplateLibrary, BlueprintTemplate } from '@/lib/automation/blueprint-templates';

const templateLibrary = new BlueprintTemplateLibrary();

export function BlueprintLibrary() {
  const [templates, setTemplates] = useState<BlueprintTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<BlueprintTemplate | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    search: ''
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [filters]);

  const loadTemplates = () => {
    const filtered = templateLibrary.getTemplates({
      category: filters.category === 'all' ? undefined : filters.category,
      difficulty: filters.difficulty === 'all' ? undefined : filters.difficulty,
      search: filters.search || undefined
    });
    setTemplates(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/10';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10';
      case 'advanced': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cannabis': return '🌿';
      case 'vegetables': return '🥬';
      case 'herbs': return '🌱';
      default: return '📋';
    }
  };

  const applyTemplate = (template: BlueprintTemplate) => {
    // In real implementation, this would create automation rules
    alert(`Template "${template.name}" has been applied to your facility!`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Operational Blueprint Library</h1>
        <p className="text-gray-400">Pre-configured automation templates from industry experts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Templates</span>
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold">{templates.length}</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Total Uses</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">
            {templates.reduce((sum, t) => sum + t.uses, 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Avg Rating</span>
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold">
            {templates.length > 0 
              ? (templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1)
              : '0.0'
            }
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Time Saved</span>
            <Clock className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold">1,250h</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="cannabis">Cannabis</option>
          <option value="vegetables">Vegetables</option>
          <option value="herbs">Herbs</option>
          <option value="general">General</option>
        </select>

        <select
          value={filters.difficulty}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <button className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Custom
        </button>
      </div>

      {/* Template Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className="bg-gray-900 rounded-xl p-6 hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
            onClick={() => {
              setSelectedTemplate(template);
              setShowPreview(true);
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getCategoryIcon(template.category)}</div>
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-400">{template.cropType || 'Multi-crop'}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {template.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{template.estimatedDuration} days</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gray-400" />
                <span>{template.phases.length} phases</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{template.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{template.uses} uses</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  applyTemplate(template);
                }}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Apply
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTemplate(template);
                  setShowPreview(true);
                }}
                className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                  <p className="text-gray-400 mt-1">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Template Info */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Duration</div>
                  <div className="text-xl font-semibold">{selectedTemplate.estimatedDuration} days</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Phases</div>
                  <div className="text-xl font-semibold">{selectedTemplate.phases.length}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Rating</div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-xl font-semibold">{selectedTemplate.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Used by</div>
                  <div className="text-xl font-semibold">{selectedTemplate.uses} growers</div>
                </div>
              </div>

              {/* Required Equipment */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Required Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.equipment.map((equip, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                      {equip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Phases */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Cultivation Phases</h3>
                <div className="space-y-4">
                  {selectedTemplate.phases.map((phase, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{phase.name}</h4>
                        <span className="text-sm text-gray-400">{phase.duration} days</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{phase.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium mb-2">Environment</div>
                          <div className="space-y-1 text-gray-400">
                            <div>Temp: {phase.environment.temperature.day}°F / {phase.environment.temperature.night}°F</div>
                            <div>RH: {phase.environment.humidity.day}% / {phase.environment.humidity.night}%</div>
                            <div>CO₂: {phase.environment.co2} ppm</div>
                            <div>Light: {phase.environment.lightIntensity} PPFD @ {phase.environment.photoperiod}h</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium mb-2">Irrigation</div>
                          <div className="space-y-1 text-gray-400">
                            <div>Frequency: {phase.irrigation.frequency}</div>
                            <div>Amount: {phase.irrigation.amount}</div>
                            <div>EC: {phase.irrigation.nutrients.ec} | pH: {phase.irrigation.nutrients.ph}</div>
                            <div>Recipe: {phase.irrigation.nutrients.recipe}</div>
                          </div>
                        </div>
                      </div>
                      
                      {phase.tasks.length > 0 && (
                        <div className="mt-3">
                          <div className="font-medium mb-1">Tasks</div>
                          <div className="space-y-1">
                            {phase.tasks.map((task, taskIdx) => (
                              <div key={taskIdx} className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="w-3 h-3" />
                                <span>Day {task.day}: {task.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    applyTemplate(selectedTemplate);
                    setShowPreview(false);
                  }}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Apply This Template
                </button>
                <button
                  className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  Duplicate & Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}