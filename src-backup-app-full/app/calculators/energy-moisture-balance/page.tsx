'use client';

import { EnergyMoistureBalanceCalculator } from '@/components/EnergyMoistureBalanceCalculator';

export default function EnergyMoistureBalancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <EnergyMoistureBalanceCalculator />
    </div>
  );
}