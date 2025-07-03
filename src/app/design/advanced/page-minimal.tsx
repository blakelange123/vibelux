'use client';

import React from 'react';
import { DesignerProvider } from '@/components/designer/context/DesignerContext';
import { NotificationProvider } from '@/components/designer/context/NotificationContext';
import { Canvas2D } from '@/components/designer/canvas/Canvas2D';

export default function MinimalAdvancedDesignerPage() {
  return (
    <NotificationProvider>
      <DesignerProvider>
        <div className="h-screen bg-gray-900 text-white">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h1 className="text-xl font-bold">Room Designer</h1>
            </div>
            <div className="flex-1 flex">
              <Canvas2D />
            </div>
          </div>
        </div>
      </DesignerProvider>
    </NotificationProvider>
  );
}