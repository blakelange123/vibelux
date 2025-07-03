'use client';

import dynamic from 'next/dynamic';

const AdvancedDesigner = dynamic(
  () => import('@/components/designer/AdvancedDesigner').then(mod => ({ default: mod.AdvancedDesigner })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading Designer...</p>
        </div>
      </div>
    )
  }
);

export default function DesignerPage() {
  return <AdvancedDesigner />;
}