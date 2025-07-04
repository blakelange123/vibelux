import { HistoricalDataImport } from '@/components/operations/HistoricalDataImport';

export default function DataImportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Historical Data Import</h1>
          <p className="text-gray-600">Import historical data for instant insights</p>
        </div>
        <HistoricalDataImport />
      </div>
    </div>
  );
}