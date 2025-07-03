'use client';

import React, { useState, useEffect } from 'react';
import {
  Leaf, Battery, Droplets, Recycle, TrendingDown, Award,
  BarChart3, PieChart, Target, Calendar, CheckCircle, XCircle
} from 'lucide-react';

interface SustainabilityMetrics {
  energyEfficiency: {
    current: number; // kWh/kg product
    target: number;
    trend: 'up' | 'down' | 'stable';
    improvement: number; // percentage
  };
  waterUsage: {
    current: number; // L/kg product
    target: number;
    recycleRate: number; // percentage
    trend: 'up' | 'down' | 'stable';
  };
  wasteManagement: {
    diversionRate: number; // percentage from landfill
    organicRecycling: number; // percentage
    plasticRecycling: number; // percentage
    totalWaste: number; // kg/month
  };
  carbonFootprint: {
    current: number; // kg CO2e/kg product
    target: number;
    offsetPercentage: number;
    renewable: number; // percentage of renewable energy
  };
  certifications: {
    organic: boolean;
    fairTrade: boolean;
    carbonNeutral: boolean;
    bCorp: boolean;
  };
}

interface SustainabilityGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  status: 'on-track' | 'at-risk' | 'completed' | 'behind';
}

export function SustainabilityDashboard() {
  const [metrics, setMetrics] = useState<SustainabilityMetrics>({
    energyEfficiency: {
      current: 5.2,
      target: 4.0,
      trend: 'down',
      improvement: 15
    },
    waterUsage: {
      current: 12.5,
      target: 10.0,
      recycleRate: 65,
      trend: 'down'
    },
    wasteManagement: {
      diversionRate: 85,
      organicRecycling: 95,
      plasticRecycling: 75,
      totalWaste: 650
    },
    carbonFootprint: {
      current: 0.85,
      target: 0.50,
      offsetPercentage: 30,
      renewable: 45
    },
    certifications: {
      organic: true,
      fairTrade: false,
      carbonNeutral: false,
      bCorp: true
    }
  });

  const [goals, setGoals] = useState<SustainabilityGoal[]>([
    {
      id: '1',
      title: 'Achieve Carbon Neutrality',
      target: 100,
      current: 30,
      unit: '%',
      deadline: new Date('2025-12-31'),
      status: 'on-track'
    },
    {
      id: '2',
      title: 'Reduce Energy Consumption',
      target: 4.0,
      current: 5.2,
      unit: 'kWh/kg',
      deadline: new Date('2024-12-31'),
      status: 'at-risk'
    },
    {
      id: '3',
      title: '100% Renewable Energy',
      target: 100,
      current: 45,
      unit: '%',
      deadline: new Date('2026-06-30'),
      status: 'on-track'
    },
    {
      id: '4',
      title: 'Zero Waste to Landfill',
      target: 100,
      current: 85,
      unit: '%',
      deadline: new Date('2025-06-30'),
      status: 'on-track'
    }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const calculateSustainabilityScore = () => {
    let score = 0;
    let weight = 0;

    // Energy efficiency (25%)
    const energyScore = Math.max(0, (1 - (metrics.energyEfficiency.current - metrics.energyEfficiency.target) / metrics.energyEfficiency.target)) * 25;
    score += energyScore;
    weight += 25;

    // Water usage (20%)
    const waterScore = Math.max(0, (1 - (metrics.waterUsage.current - metrics.waterUsage.target) / metrics.waterUsage.target)) * 20;
    score += waterScore;
    weight += 20;

    // Waste management (20%)
    const wasteScore = (metrics.wasteManagement.diversionRate / 100) * 20;
    score += wasteScore;
    weight += 20;

    // Carbon footprint (25%)
    const carbonScore = Math.max(0, (1 - (metrics.carbonFootprint.current - metrics.carbonFootprint.target) / metrics.carbonFootprint.target)) * 25;
    score += carbonScore;
    weight += 25;

    // Certifications (10%)
    const certCount = Object.values(metrics.certifications).filter(cert => cert).length;
    const certScore = (certCount / 4) * 10;
    score += certScore;
    weight += 10;

    return Math.round(score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800';
      case 'behind': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sustainabilityScore = calculateSustainabilityScore();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
          Sustainability Dashboard
        </h3>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">Overall Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(sustainabilityScore)}`}>
              {sustainabilityScore}%
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Energy Efficiency */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Battery className="w-5 h-5 text-orange-600" />
            <span className={`text-sm font-medium ${
              metrics.energyEfficiency.trend === 'down' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.energyEfficiency.improvement}% ↓
            </span>
          </div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Energy Efficiency</h4>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
            {metrics.energyEfficiency.current} kWh/kg
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Target: {metrics.energyEfficiency.target} kWh/kg
          </p>
        </div>

        {/* Water Usage */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              {metrics.waterUsage.recycleRate}% recycled
            </span>
          </div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Water Usage</h4>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
            {metrics.waterUsage.current} L/kg
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Target: {metrics.waterUsage.target} L/kg
          </p>
        </div>

        {/* Waste Diversion */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Recycle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              {metrics.wasteManagement.diversionRate}%
            </span>
          </div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Waste Diversion</h4>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
            {metrics.wasteManagement.totalWaste} kg
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Total waste this {selectedPeriod}
          </p>
        </div>

        {/* Carbon Footprint */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">
              {metrics.carbonFootprint.offsetPercentage}% offset
            </span>
          </div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Carbon Footprint</h4>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
            {metrics.carbonFootprint.current} kg CO₂e/kg
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {metrics.carbonFootprint.renewable}% renewable energy
          </p>
        </div>
      </div>

      {/* Sustainability Goals */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Sustainability Goals
        </h4>
        <div className="space-y-3">
          {goals.map(goal => {
            const progress = (goal.current / goal.target) * 100;
            const daysUntilDeadline = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={goal.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-800 dark:text-white">{goal.title}</h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(goal.status)}`}>
                    {goal.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          goal.status === 'on-track' ? 'bg-green-500' :
                          goal.status === 'at-risk' ? 'bg-yellow-500' :
                          goal.status === 'behind' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {goal.current} / {goal.target} {goal.unit}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {daysUntilDeadline} days left
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Certifications & Standards
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(metrics.certifications).map(([cert, achieved]) => (
            <div
              key={cert}
              className={`flex items-center gap-2 p-3 rounded-lg border ${
                achieved ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600' : 'bg-gray-100 dark:bg-gray-600 border-gray-200 dark:border-gray-500'
              }`}
            >
              {achieved ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className={`text-sm font-medium ${
                achieved ? 'text-green-800' : 'text-gray-600'
              }`}>
                {cert.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}