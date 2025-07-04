'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Droplets, Thermometer, Wind, Gauge } from 'lucide-react';

interface EnvironmentalKPIsProps {
  temperature: number;
  humidity: number;
  co2?: number;
  light?: number;
  airflow?: number;
}

export function EnvironmentalKPIs({ 
  temperature, 
  humidity, 
  co2 = 800, 
  light = 650,
  airflow = 0.5 
}: EnvironmentalKPIsProps) {
  // Calculate VPD (Vapor Pressure Deficit)
  const calculateVPD = (temp: number, rh: number): number => {
    // Saturation vapor pressure at temperature
    const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    // Actual vapor pressure
    const avp = (rh / 100) * svp;
    // VPD in kPa
    return Number((svp - avp).toFixed(2));
  };

  const vpd = calculateVPD(temperature, humidity);
  const vpdStatus = vpd >= 0.8 && vpd <= 1.2 ? 'optimal' : vpd < 0.8 ? 'low' : 'high';
  
  const kpis = [
    {
      label: 'VPD',
      value: vpd,
      unit: 'kPa',
      icon: Gauge,
      status: vpdStatus,
      optimal: '0.8-1.2',
      trend: vpd > 1.0 ? 'up' : vpd < 1.0 ? 'down' : 'stable'
    },
    {
      label: 'Temperature',
      value: temperature,
      unit: '°C',
      icon: Thermometer,
      status: temperature >= 22 && temperature <= 28 ? 'optimal' : 'warning',
      optimal: '22-28',
      trend: 'stable'
    },
    {
      label: 'Humidity',
      value: humidity,
      unit: '%',
      icon: Droplets,
      status: humidity >= 50 && humidity <= 70 ? 'optimal' : 'warning',
      optimal: '50-70',
      trend: 'stable'
    },
    {
      label: 'CO₂',
      value: co2,
      unit: 'ppm',
      icon: Wind,
      status: co2 >= 800 && co2 <= 1200 ? 'optimal' : co2 < 800 ? 'low' : 'high',
      optimal: '800-1200',
      trend: co2 > 1000 ? 'up' : 'stable'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div 
            key={kpi.label}
            className={`rounded-lg border p-3 md:p-4 transition-all duration-300 hover:scale-105 ${getStatusColor(kpi.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{kpi.label}</span>
              </div>
              {getTrendIcon(kpi.trend)}
            </div>
            <div className="text-2xl font-bold">
              {kpi.value}
              <span className="text-sm font-normal ml-1">{kpi.unit}</span>
            </div>
            <div className="text-xs opacity-75 mt-1">
              Optimal: {kpi.optimal} {kpi.unit}
            </div>
          </div>
        );
      })}
    </div>
  );
}