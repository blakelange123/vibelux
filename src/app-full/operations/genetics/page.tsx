import { GeneticTrackingSystem } from '@/components/operations/GeneticTrackingSystem';

export default function GeneticTrackingPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Genetic Tracking System</h1>
          <p className="text-gray-400">Strain management and lineage tracking</p>
        </div>
        <GeneticTrackingSystem />
      </div>
    </div>
  );
}