'use client';

import React, { useState } from 'react';
import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder';
import { dashboardTemplates } from '@/lib/dashboard-templates';
import { motion } from 'framer-motion';
import { Plus, Layout, FileText, Settings } from 'lucide-react';

export default function DashboardBuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowBuilder(true);
  };

  const handleCreateBlank = () => {
    setSelectedTemplate(null);
    setShowBuilder(true);
  };

  if (showBuilder) {
    const template = selectedTemplate 
      ? dashboardTemplates.find(t => t.id === selectedTemplate)
      : null;

    return (
      <div className="h-screen bg-gray-950">
        <DashboardBuilder initialTemplate={template} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Builder</h1>
          <p className="text-gray-400">
            Create custom dashboards for monitoring and control
          </p>
        </div>

        {/* Create New Dashboard */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Create New Dashboard</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateBlank}
            className="w-full max-w-md p-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all"
          >
            <div className="flex items-center justify-center gap-4">
              <Plus className="w-12 h-12 text-white" />
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white">Blank Dashboard</h3>
                <p className="text-violet-200">Start from scratch</p>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Templates */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Start from a Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardTemplates.map((template) => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectTemplate(template.id)}
                className="p-6 bg-gray-900 border border-gray-800 rounded-lg hover:border-violet-600 transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    {template.category === 'environment' && <Layout className="w-6 h-6 text-green-400" />}
                    {template.category === 'operations' && <Settings className="w-6 h-6 text-blue-400" />}
                    {template.category === 'analytics' && <FileText className="w-6 h-6 text-purple-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{template.widgets.length} widgets</span>
                      <span>•</span>
                      <span className="capitalize">{template.category}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Existing Dashboards */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Dashboards</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-500">No saved dashboards yet</p>
            <p className="text-sm text-gray-600 mt-2">
              Create your first dashboard to see it here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}