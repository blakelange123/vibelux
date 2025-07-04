'use client';

import React, { useState, useEffect } from 'react';
import { Sun } from 'lucide-react';
import { getSolarDataForZipCode, calculateSupplementalLighting, GREENHOUSE_TYPES } from '@/lib/solar-calculations';

interface GreenhouseCalculatorProps {
  targetDLI: number;
  photoperiod: number;
  onPPFDCalculated?: (ppfd: number) => void;
  className?: string;
}

export default function GreenhouseCalculator({ 
  targetDLI, 
  photoperiod, 
  onPPFDCalculated,
  className = ''
}: GreenhouseCalculatorProps) {
  const [zipCode, setZipCode] = useState('');
  const [greenhouseType, setGreenhouseType] = useState('glass');
  const [solarDLI, setSolarDLI] = useState(0);
  const [solarLocation, setSolarLocation] = useState('');
  const [calculatedPPFD, setCalculatedPPFD] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');

  // Calculate solar DLI based on ZIP code
  const calculateSolarDLI = async () => {
    if (!zipCode || zipCode.length !== 5) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }
    
    setIsCalculating(true);
    setError('');
    
    try {
      const solarData = await getSolarDataForZipCode(zipCode);
      setSolarDLI(solarData.annualAvgDLI);
      setSolarLocation(solarData.location);
      
      // Calculate required PPFD
      const transmission = GREENHOUSE_TYPES[greenhouseType as keyof typeof GREENHOUSE_TYPES].transmission;
      const result = calculateSupplementalLighting(
        targetDLI,
        solarData.annualAvgDLI,
        transmission,
        photoperiod
      );
      
      setCalculatedPPFD(result.requiredPPFD);
      onPPFDCalculated?.(result.requiredPPFD);
      
    } catch (error) {
      console.error('Error calculating solar DLI:', error);
      setError('Error calculating solar data. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Recalculate PPFD when relevant values change
  useEffect(() => {
    if (solarDLI > 0) {
      const transmission = GREENHOUSE_TYPES[greenhouseType as keyof typeof GREENHOUSE_TYPES].transmission;
      const result = calculateSupplementalLighting(
        targetDLI,
        solarDLI,
        transmission,
        photoperiod
      );
      
      setCalculatedPPFD(result.requiredPPFD);
      onPPFDCalculated?.(result.requiredPPFD);
    }
  }, [targetDLI, photoperiod, greenhouseType, solarDLI, onPPFDCalculated]);

  const transmission = GREENHOUSE_TYPES[greenhouseType as keyof typeof GREENHOUSE_TYPES].transmission;
  const effectiveSolarDLI = solarDLI * transmission;
  const requiredSupplementalDLI = Math.max(0, targetDLI - effectiveSolarDLI);
  const solarContribution = targetDLI > 0 ? Math.round((effectiveSolarDLI / targetDLI) * 100) : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Sun className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold">Greenhouse Solar Calculator</h3>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">ZIP Code</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="Enter ZIP code"
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
          />
          <button 
            onClick={calculateSolarDLI}
            disabled={!zipCode || zipCode.length !== 5 || isCalculating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-sm font-medium transition-colors"
          >
            {isCalculating ? 'Calculating...' : 'Calculate'}
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-xs mt-1">{error}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Greenhouse Type</label>
        <select 
          value={greenhouseType}
          onChange={(e) => setGreenhouseType(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {Object.entries(GREENHOUSE_TYPES).map(([key, type]) => (
            <option key={key} value={key}>
              {type.name} ({Math.round(type.transmission * 100)}% transmission)
            </option>
          ))}
        </select>
      </div>
      
      {solarDLI > 0 && (
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-4">
          <div className="space-y-3">
            {solarLocation && (
              <div className="text-sm text-gray-300">
                <span className="text-gray-400">Location:</span> {solarLocation}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Solar DLI (Annual Avg)</div>
                <div className="text-xl font-semibold text-blue-300">{solarDLI.toFixed(1)}</div>
                <div className="text-xs text-gray-500">mol/m²/day</div>
              </div>
              
              <div>
                <div className="text-gray-400">After Transmission</div>
                <div className="text-xl font-semibold text-blue-300">{effectiveSolarDLI.toFixed(1)}</div>
                <div className="text-xs text-gray-500">mol/m²/day</div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-blue-700/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Solar Contribution</span>
                <span className="text-sm font-medium text-blue-300">{solarContribution}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, solarContribution)}%` }}
                />
              </div>
            </div>
            
            <div className="pt-3 border-t border-blue-700/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Required Supplemental DLI</span>
                <span className="text-yellow-300 font-medium">{requiredSupplementalDLI.toFixed(1)} mol/m²/day</span>
              </div>
              
              <div className="bg-purple-900/30 border border-purple-700/50 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">Recommended Supplemental PPFD</div>
                <div className="text-2xl font-bold text-green-400">{calculatedPPFD}</div>
                <div className="text-xs text-gray-500">μmol/m²/s</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}