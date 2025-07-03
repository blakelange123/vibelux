export default function Designer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Lighting Designer</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-4">
              Design optimal lighting layouts for your controlled environment agriculture facility.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Room Designer</h3>
                <p className="text-gray-600">Create 2D and 3D lighting layouts</p>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Launch Designer
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
                <p className="text-gray-600">Get AI-powered design recommendations</p>
                <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Start AI Design
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}