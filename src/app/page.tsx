export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            VibeLux - Horticultural Lighting Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional lighting design and optimization for controlled environment agriculture
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Advanced Designer</h3>
              <p className="text-gray-600">Design optimal lighting layouts for your facility</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Energy Optimization</h3>
              <p className="text-gray-600">Reduce energy costs with intelligent control systems</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">AI-Powered Analytics</h3>
              <p className="text-gray-600">Maximize yields with data-driven insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}