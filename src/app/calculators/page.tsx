import Link from 'next/link'

export default function Calculators() {
  const calculators = [
    { 
      name: 'PPFD Calculator', 
      description: 'Calculate photosynthetic photon flux density and daily light integral',
      href: '/calculators/ppfd',
      status: 'active'
    },
    { 
      name: 'Heat Load Calculator', 
      description: 'Thermal management and cooling requirements',
      href: '/calculators/heat-load',
      status: 'active'
    },
    { 
      name: 'VPD Calculator', 
      description: 'Vapor pressure deficit optimization for plant health',
      href: '/calculators/vpd',
      status: 'active'
    },
    { 
      name: 'DLI Calculator', 
      description: 'Daily light integral calculations',
      href: '/calculators/dli',
      status: 'coming-soon'
    },
    { 
      name: 'Energy Cost Calculator', 
      description: 'Estimate operational energy costs',
      href: '/calculators/energy-cost',
      status: 'coming-soon'
    },
    { 
      name: 'ROI Calculator', 
      description: 'Return on investment analysis',
      href: '/calculators/roi',
      status: 'coming-soon'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Horticultural Calculators</h1>
          <p className="text-gray-600 mb-8">
            Professional tools for lighting design and optimization calculations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculators.map((calc, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{calc.name}</h3>
                  {calc.status === 'active' && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                  {calc.status === 'coming-soon' && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{calc.description}</p>
                {calc.status === 'active' ? (
                  <Link 
                    href={calc.href}
                    className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
                  >
                    Open Calculator
                  </Link>
                ) : (
                  <button 
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">About Our Calculators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Scientific Accuracy</h3>
                <p className="text-gray-600 text-sm">
                  All calculations are based on peer-reviewed research and industry standards for controlled environment agriculture.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Real-time Results</h3>
                <p className="text-gray-600 text-sm">
                  Interactive calculators provide instant feedback as you adjust parameters, helping you optimize your growing environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}