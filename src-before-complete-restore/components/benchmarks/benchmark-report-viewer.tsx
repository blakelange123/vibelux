export default function BenchmarkReportViewer() {
  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Benchmark Report</h2>
      <div className="space-y-4">
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
          <p className="text-gray-400 mt-2">Detailed benchmark analysis will appear here</p>
        </div>
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="text-lg font-semibold text-white">Industry Comparison</h3>
          <p className="text-gray-400 mt-2">Compare your metrics against industry standards</p>
        </div>
      </div>
    </div>
  )
}