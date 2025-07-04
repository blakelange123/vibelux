"use client"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Debug JavaScript Events</h1>
      
      <div className="space-y-4 max-w-2xl">
        <p className="text-gray-400 mb-8">
          Testing different ways to attach event handlers in Next.js 15.3.3
        </p>
        
        {/* Test 1: Basic inline onClick */}
        <div className="p-4 bg-gray-900 rounded-lg">
          <h2 className="font-semibold mb-2">Test 1: Basic Inline onClick</h2>
          <button 
            onClick={() => {
              alert('Basic inline onClick works!')
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Click Me
          </button>
        </div>
        
        {/* Test 2: onClick with function call */}
        <div className="p-4 bg-gray-900 rounded-lg">
          <h2 className="font-semibold mb-2">Test 2: onClick with Console Log</h2>
          <button 
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Check Console
          </button>
        </div>
        
        {/* Test 3: Multiple event types */}
        <div className="p-4 bg-gray-900 rounded-lg">
          <h2 className="font-semibold mb-2">Test 3: Multiple Event Types</h2>
          <button 
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            Hover & Click (Check Console)
          </button>
        </div>
        
        {/* Test 4: Form submission */}
        <div className="p-4 bg-gray-900 rounded-lg">
          <h2 className="font-semibold mb-2">Test 4: Form Submission</h2>
          <form onSubmit={(e) => {
            e.preventDefault()
            alert('Form submitted!')
          }}>
            <input 
              type="text" 
              placeholder="Type something..."
              className="px-3 py-2 bg-gray-800 rounded mr-2"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
            >
              Submit
            </button>
          </form>
        </div>
        
        {/* Test 5: High z-index button */}
        <div className="p-4 bg-gray-900 rounded-lg">
          <h2 className="font-semibold mb-2">Test 5: High Z-Index Button</h2>
          <button 
            onClick={() => alert('High z-index button clicked!')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded relative"
            style={{ zIndex: 999999 }}
          >
            Z-Index: 999999
          </button>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-12 p-4 bg-gray-900 rounded-lg max-w-2xl">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-gray-400">
          <li>Open browser console (F12)</li>
          <li>Click each button and observe the results</li>
          <li>Check console for event logs</li>
          <li>If alerts don't show, JavaScript events are blocked</li>
        </ol>
      </div>
    </div>
  )
}