'use client';
import { SystemDiagnostics } from '@/components/maintenance/SystemDiagnostics';

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-[1920px] mx-auto p-6">
        <SystemDiagnostics />
      </div>
    </div>
  );
}