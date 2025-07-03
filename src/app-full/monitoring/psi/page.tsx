'use client';

import { PSIDashboard } from '@/components/monitoring/PSIDashboard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PSIMonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/monitoring" 
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">PSI Monitoring</h1>
        </div>

        {/* PSI Dashboard */}
        <PSIDashboard />
      </div>
    </div>
  );
}