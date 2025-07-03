'use client';

import React from 'react';
import { X, Activity, Clock, Calendar, Zap, TrendingUp, AlertTriangle, DollarSign, Wrench, BarChart3 } from 'lucide-react';
import { Equipment } from '@/lib/equipment-manager';

interface EquipmentDetailsModalProps {
  equipment: Equipment;
  isOpen: boolean;
  onClose: () => void;
}

export function EquipmentDetailsModal({ equipment, isOpen, onClose }: EquipmentDetailsModalProps) {
  if (!isOpen) return null;

  // Calculate runtime statistics
  const dailyAverage = equipment.usage.totalHours / 30; // Assuming 30 days
  const weeklyRuntime = equipment.usage.dailyHours.reduce((a, b) => a + b, 0);
  const monthlyRuntime = dailyAverage * 30;
  const yearlyProjected = equipment.usage.totalHours * (365 / 180); // Assuming 180 days of data
  
  // Calculate energy consumption
  const totalKWh = (equipment.usage.totalHours * equipment.specifications.power) / 1000;
  const dailyKWh = (dailyAverage * equipment.specifications.power) / 1000;
  const monthlyCost = (monthlyRuntime * equipment.specifications.power / 1000) * 0.12; // $0.12/kWh average

  // Maintenance calculations
  const maintenancePercentage = equipment.maintenance.schedule[0] 
    ? ((equipment.usage.totalHours % equipment.maintenance.schedule[0].frequency.value) / equipment.maintenance.schedule[0].frequency.value) * 100
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">{equipment.name}</h2>
            <p className="text-sm text-gray-400">
              {equipment.manufacturer} {equipment.model} • S/N: {equipment.serialNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Status and Location */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Status & Location</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className={`font-medium ${
                    equipment.status === 'active' ? 'text-green-400' : 
                    equipment.status === 'maintenance' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {equipment.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Facility</span>
                  <span className="text-white">{equipment.location.facility}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Room</span>
                  <span className="text-white">{equipment.location.room}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Zone</span>
                  <span className="text-white">{equipment.location.zone}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Specifications</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Power Rating</span>
                  <span className="text-white font-medium">{equipment.specifications.power}W</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Voltage</span>
                  <span className="text-white">{equipment.specifications.voltage}V</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Efficiency</span>
                  <span className="text-white">{equipment.specifications.efficiency} μmol/J</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Type</span>
                  <span className="text-white capitalize">{equipment.type}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Runtime Statistics */}
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Runtime Hours & Statistics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <p className="text-sm text-gray-400">Total Runtime</p>
                </div>
                <p className="text-2xl font-bold text-white">{equipment.usage.totalHours.toLocaleString()}</p>
                <p className="text-xs text-gray-400">hours</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <p className="text-sm text-gray-400">Daily Average</p>
                </div>
                <p className="text-2xl font-bold text-white">{dailyAverage.toFixed(1)}</p>
                <p className="text-xs text-gray-400">hours/day</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  <p className="text-sm text-gray-400">This Week</p>
                </div>
                <p className="text-2xl font-bold text-white">{weeklyRuntime}</p>
                <p className="text-xs text-gray-400">hours</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <p className="text-sm text-gray-400">Yearly Projection</p>
                </div>
                <p className="text-2xl font-bold text-white">{Math.round(yearlyProjected).toLocaleString()}</p>
                <p className="text-xs text-gray-400">hours</p>
              </div>
            </div>

            {/* Daily Usage Chart */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-3">Daily Usage Pattern (Last 7 Days)</p>
              <div className="flex items-end justify-between h-20 gap-2">
                {equipment.usage.dailyHours.map((hours, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-purple-600 rounded-t"
                      style={{ height: `${(hours / 24) * 100}%` }}
                    />
                    <span className="text-xs text-gray-400 mt-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Energy & Cost */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Energy Consumption
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Energy Used</span>
                  <span className="text-white font-medium">{totalKWh.toFixed(1)} kWh</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Daily Average</span>
                  <span className="text-white">{dailyKWh.toFixed(2)} kWh</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Monthly Projection</span>
                  <span className="text-white">{(monthlyRuntime * equipment.specifications.power / 1000).toFixed(1)} kWh</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Cost Analysis
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Purchase Cost</span>
                  <span className="text-white font-medium">${equipment.cost.purchase.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Installation Cost</span>
                  <span className="text-white">${equipment.cost.installation.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Monthly Energy Cost</span>
                  <span className="text-white">${monthlyCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-400" />
              Maintenance Schedule
            </h3>
            <div className="space-y-3">
              {equipment.maintenance.schedule.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{schedule.name}</p>
                    <p className="text-sm text-gray-400">{schedule.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Every {schedule.frequency.value} {schedule.frequency.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Next Due</p>
                    <p className="font-medium text-white">
                      {equipment.maintenance.nextDue?.toLocaleDateString()}
                    </p>
                    {maintenancePercentage > 80 && (
                      <p className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        Due Soon
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warranty Information */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Warranty Information</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Purchase Date: {equipment.purchaseDate.toLocaleDateString()}</p>
                <p className="text-white">Warranty Expires: {equipment.warrantyExpiration.toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Warranty Status</p>
                <p className={`font-medium ${
                  equipment.warrantyExpiration > new Date() ? 'text-green-400' : 'text-red-400'
                }`}>
                  {equipment.warrantyExpiration > new Date() ? 'Active' : 'Expired'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}