'use client';

import React from 'react';
import { MonteCarloRayTracing } from '../raytracing/MonteCarloRayTracer';

interface PanelProps {
  onClose: () => void;
}

export function MonteCarloRayTracingPanel({ onClose }: PanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-[900px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <MonteCarloRayTracing onClose={onClose} />
      </div>
    </div>
  );
}