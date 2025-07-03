export default function TestCSSPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">CSS Test Page</h1>
      
      {/* Test basic Tailwind classes */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Basic Tailwind Classes</h2>
        <div className="bg-blue-500 text-white p-4 rounded-lg mb-2">
          Blue background (bg-blue-500)
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg mb-2">
          Gradient background (bg-gradient-to-r from-purple-500 to-pink-500)
        </div>
      </div>

      {/* Test custom gradients */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Custom Classes from globals.css</h2>
        <div className="btn-gradient text-white p-4 rounded-lg mb-2">
          Button gradient (btn-gradient)
        </div>
        <div className="text-gradient text-4xl font-bold mb-2">
          Text gradient (text-gradient)
        </div>
        <div className="gradient-purple p-4 rounded-lg mb-2 text-white">
          Purple gradient (gradient-purple)
        </div>
        <div className="gradient-green p-4 rounded-lg mb-2 text-white">
          Green gradient (gradient-green)
        </div>
      </div>

      {/* Test CSS variables */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">CSS Variables</h2>
        <div style={{ backgroundColor: 'var(--primary)', color: 'white' }} className="p-4 rounded-lg mb-2">
          Primary color (var(--primary))
        </div>
        <div style={{ backgroundColor: 'var(--secondary)', color: 'white' }} className="p-4 rounded-lg mb-2">
          Secondary color (var(--secondary))
        </div>
      </div>
    </div>
  )
}