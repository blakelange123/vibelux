'use client';
import { SystemArchitectureView } from '@/components/architecture/SystemArchitectureView';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-[1920px] mx-auto p-6">
        <SystemArchitectureView />
      </div>
    </div>
  );
}