'use client';

import React from 'react';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, Settings, BarChart3, Activity } from 'lucide-react';

export default function DashboardDemoSimplePage() {
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            VibeLux Dashboard Features
          </h1>
          <p className="text-xl text-gray-400">
            Explore our enhanced visualization and dashboard capabilities
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <AnimatedCard hover>
            <AnimatedCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-8 h-8 text-purple-400" />
                <AnimatedCardTitle>Dashboard Builder</AnimatedCardTitle>
              </div>
              <p className="text-gray-400">
                Create custom dashboards with drag-and-drop widgets and real-time data binding
              </p>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>9 Widget Types</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Real-time Data Binding</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Modbus/SCADA Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Dashboard Templates</span>
                  </div>
                </div>
                <Link href="/dashboard-builder">
                  <AnimatedButton className="w-full">
                    Open Dashboard Builder
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </AnimatedButton>
                </Link>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard hover>
            <AnimatedCardHeader>
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-8 h-8 text-blue-400" />
                <AnimatedCardTitle>3D Visualization</AnimatedCardTitle>
              </div>
              <p className="text-gray-400">
                Interactive 3D grow room with real-time sensor data overlay
              </p>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Live Sensor Overlay</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Interactive Controls</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Alert Indicators</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Multi-Zone Monitoring</span>
                  </div>
                </div>
                <Link href="/3d-visualization">
                  <AnimatedButton className="w-full" variant="outline">
                    Open 3D Visualization
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </AnimatedButton>
                </Link>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <AnimatedCard>
            <AnimatedCardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Enhanced with Modern Animations
              </h2>
              <p className="text-gray-400 mb-6">
                All UI components now feature smooth Framer Motion animations for improved user experience
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Settings className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Micro-interactions</h3>
                  <p className="text-gray-500">Button clicks, hovers, and state changes</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Data Transitions</h3>
                  <p className="text-gray-500">Smooth chart updates and number counters</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Page Transitions</h3>
                  <p className="text-gray-500">Entrance animations and layout shifts</p>
                </div>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
}