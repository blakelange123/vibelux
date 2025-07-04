export default function APIDocumentationPortal() {
  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">API Documentation Portal</h2>
      <div className="space-y-4 text-gray-300">
        <p>Complete API documentation for VibeLux platform integration.</p>
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="font-semibold mb-2">Available Endpoints</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>/api/v1/sensors - Sensor data management</li>
            <li>/api/v1/environmental - Environmental monitoring</li>
            <li>/api/v1/lighting - Lighting control</li>
            <li>/api/v1/cultivation - Cultivation tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}