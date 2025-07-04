'use client';

import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Sparkles, Calendar, Factory } from 'lucide-react';
import { EnhancedProductionPlanner } from './EnhancedProductionPlanner';

// Basic legacy interfaces for the old version
interface ProductionPhase {
  id: string;
  name: string;
  weekStart: number;
  weekEnd: number;
  tasks: Task[];
  environmentalSettings: EnvironmentalSettings;
  qualityTargets: QualityTargets;
}

interface Task {
  id: string;
  name: string;
  week: number;
  day?: number;
  completed: boolean;
  critical: boolean;
  category: 'cultural' | 'environmental' | 'chemical' | 'monitoring';
  notes?: string;
}

interface EnvironmentalSettings {
  dayTemp: { min: number; max: number };
  nightTemp: { min: number; max: number };
  humidity: { min: number; max: number };
  lightIntensity: number;
  photoperiod: number;
  co2?: number;
}

interface QualityTargets {
  height?: { min: number; max: number };
  width?: { min: number; max: number };
  stems?: number;
  flowerSize?: number;
  color?: string;
}

interface CropTemplate {
  id: string;
  name: string;
  cropType: string;
  cultivar: string;
  productionWeeks: number;
  targetDate: Date;
  phases: ProductionPhase[];
}

// Legacy basic production planner component
function BasicProductionPlanner() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('tomato-trust');
  const [plantDate, setPlantDate] = useState<Date>(new Date());
  const [targetMarketDate, setTargetMarketDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(11);
    date.setDate(15);
    return date;
  });
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Basic crop templates
  const cropTemplates: Record<string, CropTemplate> = {
    'tomato-trust': {
      id: 'tomato-trust',
      name: 'Tomato - Trust',
      cropType: 'Vegetable',
      cultivar: 'Trust',
      productionWeeks: 20,
      targetDate: new Date(2024, 7, 1),
      phases: [
        {
          id: 'germination',
          name: 'Germination & Seedling',
          weekStart: 1,
          weekEnd: 3,
          tasks: [
            { id: 'tm1', name: 'Seed sowing', week: 1, day: 1, completed: false, critical: true, category: 'cultural' },
            { id: 'tm2', name: 'Maintain propagation environment', week: 1, completed: false, critical: true, category: 'environmental' },
            { id: 'tm3', name: 'Monitor germination', week: 2, completed: false, critical: true, category: 'monitoring' },
          ],
          environmentalSettings: {
            dayTemp: { min: 75, max: 80 },
            nightTemp: { min: 70, max: 75 },
            humidity: { min: 75, max: 85 },
            lightIntensity: 200,
            photoperiod: 16,
            co2: 400
          },
          qualityTargets: {
            height: { min: 3, max: 5 }
          }
        }
      ]
    }
  };

  const template = cropTemplates[selectedTemplate];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/20 mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Basic Production Planning
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Simple week-by-week production scheduling
        </p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
        <div className="text-center">
          <Factory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Basic Version</h3>
          <p className="text-gray-400 mb-4">
            This is the legacy basic production planner. For advanced features, switch to the Enhanced version above.
          </p>
          <div className="space-y-3 text-sm text-gray-400">
            <p>✓ Simple task tracking</p>
            <p>✓ Basic environmental settings</p>
            <p>✓ Week-by-week timeline</p>
            <p className="text-emerald-400 font-medium">Switch to Enhanced for enterprise features!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main wrapper component with toggle
export function ProductionPlanner() {
  const [useEnhanced, setUseEnhanced] = useState(true);

  return (
    <div className="space-y-6">
      {/* Version Toggle */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800 mb-6">
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${!useEnhanced ? 'text-white' : 'text-gray-400'}`}>
            Basic Planner
          </span>
          <button
            onClick={() => setUseEnhanced(!useEnhanced)}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            role="switch"
            aria-checked={useEnhanced}
          >
            <span className="sr-only">Use enhanced version</span>
            <span
              className={`${
                useEnhanced ? 'translate-x-7' : 'translate-x-1'
              } inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center`}
            >
              {useEnhanced ? (
                <ToggleRight className="w-4 h-4 text-emerald-600" />
              ) : (
                <ToggleLeft className="w-4 h-4 text-gray-600" />
              )}
            </span>
          </button>
          <span className={`text-sm font-medium flex items-center gap-1 ${useEnhanced ? 'text-white' : 'text-gray-400'}`}>
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Enhanced Planner
          </span>
        </div>
        
        {useEnhanced && (
          <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <div className="text-center text-sm text-emerald-400">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Now using the Advanced Production Management System with enterprise features!
            </div>
          </div>
        )}
      </div>

      {/* Component Display */}
      {useEnhanced ? (
        <EnhancedProductionPlanner />
      ) : (
        <BasicProductionPlanner />
      )}
    </div>
  );
}