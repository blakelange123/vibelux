export default function Calculators() {
  const calculators = [
    { name: 'PPFD Calculator', description: 'Calculate photosynthetic photon flux density' },
    { name: 'DLI Calculator', description: 'Daily light integral calculations' },
    { name: 'Heat Load Calculator', description: 'Thermal management calculations' },
    { name: 'Energy Cost Calculator', description: 'Estimate operational energy costs' },
    { name: 'ROI Calculator', description: 'Return on investment analysis' },
    { name: 'VPD Calculator', description: 'Vapor pressure deficit optimization' },
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
                <h3 className="text-lg font-semibold mb-2">{calc.name}</h3>
                <p className="text-gray-600 mb-4">{calc.description}</p>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                  Open Calculator
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}