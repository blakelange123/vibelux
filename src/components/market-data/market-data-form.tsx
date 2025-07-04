export default function MarketDataForm() {
  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">Market Data Input</h3>
      <form className="space-y-4">
        <input 
          type="text" 
          placeholder="Enter market data..." 
          className="w-full p-2 bg-gray-800 text-white rounded"
        />
        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
          Submit
        </button>
      </form>
    </div>
  )
}