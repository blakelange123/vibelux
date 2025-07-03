export default function Energy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Energy Optimization</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-6">
              Monitor and optimize energy consumption for maximum efficiency and cost savings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
                <p className="text-gray-600">Track energy usage across all systems</p>
                <div className="mt-4 text-2xl font-bold text-blue-600">1,247 kWh</div>
                <div className="text-sm text-gray-500">Today&apos;s consumption</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Cost Savings</h3>
                <p className="text-gray-600">Potential monthly savings</p>
                <div className="mt-4 text-2xl font-bold text-green-600">$2,847</div>
                <div className="text-sm text-gray-500">With optimization</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700">
                View Dashboard
              </button>
              <button className="bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700">
                Run Analysis
              </button>
              <button className="bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700">
                Setup Monitoring
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}