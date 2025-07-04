import Link from 'next/link'

export default function Designer() {
  const designTools = [
    {
      title: 'Advanced Designer',
      description: 'Professional lighting layout design with 2D/3D visualization and real-time analysis',
      features: ['Interactive 2D canvas', '3D room visualization', 'PPFD analysis', 'Auto optimization'],
      href: '/designer/advanced',
      status: 'active',
      color: 'blue'
    },
    {
      title: 'Quick Designer',
      description: 'Fast fixture placement with basic calculations',
      features: ['Simple layout', 'Basic PPFD calc', 'Quick export'],
      href: '/designer/quick',
      status: 'coming-soon',
      color: 'green'
    },
    {
      title: 'AI Design Assistant',
      description: 'Get AI-powered design recommendations based on your crops and goals',
      features: ['Crop optimization', 'Smart suggestions', 'Cost analysis'],
      href: '/designer/ai',
      status: 'coming-soon',
      color: 'purple'
    },
    {
      title: 'Template Library',
      description: 'Pre-designed layouts for common facility types',
      features: ['Greenhouse templates', 'Indoor farm layouts', 'Research setups'],
      href: '/designer/templates',
      status: 'coming-soon',
      color: 'orange'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Lighting Designer Suite</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional tools for designing optimal lighting layouts for controlled environment agriculture. 
              From quick layouts to advanced 3D analysis, we have the right tool for your project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {designTools.map((tool, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`h-2 bg-${tool.color}-500`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{tool.title}</h3>
                    {tool.status === 'active' && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                    {tool.status === 'coming-soon' && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Soon
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{tool.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {tool.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {tool.status === 'active' ? (
                    <Link 
                      href={tool.href}
                      className={`block w-full bg-${tool.color}-600 text-white py-3 px-4 rounded-lg hover:bg-${tool.color}-700 text-center font-medium transition-colors`}
                    >
                      Launch Designer
                    </Link>
                  ) : (
                    <button 
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Scientific Accuracy</h3>
                <p className="text-gray-600 text-sm">
                  All calculations based on photobiological research and industry standards
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-time Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Instant feedback on PPFD, uniformity, and energy efficiency as you design
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Professional Export</h3>
                <p className="text-gray-600 text-sm">
                  Export detailed reports, CAD files, and photometric data for implementation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}