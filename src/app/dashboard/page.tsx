export default function Dashboard() {
  const metrics = [
    { label: 'Active Facilities', value: '12', change: '+2' },
    { label: 'Energy Efficiency', value: '94%', change: '+3%' },
    { label: 'Monthly Savings', value: '$8,432', change: '+12%' },
    { label: 'System Uptime', value: '99.7%', change: '+0.2%' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Operations Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {metric.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Energy optimization completed</span>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">New facility onboarded</span>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-700">System maintenance completed</span>
                  <span className="text-sm text-gray-500">3 days ago</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left bg-blue-50 hover:bg-blue-100 p-3 rounded border">
                  Generate Energy Report
                </button>
                <button className="w-full text-left bg-green-50 hover:bg-green-100 p-3 rounded border">
                  Schedule Maintenance
                </button>
                <button className="w-full text-left bg-purple-50 hover:bg-purple-100 p-3 rounded border">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}