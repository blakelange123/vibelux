import { UnifiedAnalytics } from '@/components/operations/UnifiedAnalytics';

export default function UnifiedAnalyticsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Unified Analytics</h1>
          <p className="text-gray-400">Unified performance insights</p>
        </div>
        <UnifiedAnalytics />
      </div>
    </div>
  );
}