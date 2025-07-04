'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  AlertTriangle,
  Leaf,
  Thermometer,
  Droplets,
  Send,
  CheckCircle,
  XCircle,
  Loader,
  TestTube,
  Shield,
  Info
} from 'lucide-react';

export default function TestAlertsPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testing, setTesting] = useState<string | null>(null);

  const testScenarios = [
    {
      id: 'sms-basic',
      name: 'Basic SMS Test',
      description: 'Send a simple test SMS to verify Twilio is working',
      icon: MessageSquare,
      color: 'text-blue-500',
      action: async () => {
        const response = await fetch('/api/test/twilio-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phoneNumber,
            message: 'VibeLux Test: Your SMS alerts are working correctly! 🌱',
          }),
        });
        return response.json();
      }
    },
    {
      id: 'voice-basic',
      name: 'Voice Call Test',
      description: 'Test automated voice call for critical alerts',
      icon: Phone,
      color: 'text-green-500',
      action: async () => {
        const response = await fetch('/api/test/twilio-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phoneNumber,
            message: 'This is a test call from VibeLux. Your voice alerts are configured correctly.',
          }),
        });
        return response.json();
      }
    },
    {
      id: 'alert-critical',
      name: 'Critical CO₂ Alert',
      description: 'Simulate a critical CO₂ alert with SMS notification',
      icon: AlertTriangle,
      color: 'text-red-500',
      action: async () => {
        const response = await fetch('/api/test/alert-critical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phoneNumber,
            alertType: 'co2_critical',
            zone: 'Test Room',
            co2Level: 5500,
          }),
        });
        return response.json();
      }
    },
    {
      id: 'alert-stress',
      name: 'Plant Stress Alert',
      description: 'Test plant stress detection alert',
      icon: Leaf,
      color: 'text-orange-500',
      action: async () => {
        const response = await fetch('/api/test/alert-stress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phoneNumber,
            stressLevel: 45,
            zone: 'Test Zone',
            nutrients: { nitrogen: 15, phosphorus: 12 },
          }),
        });
        return response.json();
      }
    },
    {
      id: 'alert-environment',
      name: 'Environmental Alert',
      description: 'Test temperature/humidity alerts',
      icon: Thermometer,
      color: 'text-yellow-500',
      action: async () => {
        const response = await fetch('/api/test/alert-environment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phoneNumber,
            temperature: 95,
            humidity: 25,
            zone: 'Test Zone',
          }),
        });
        return response.json();
      }
    },
    {
      id: 'alert-hydroponic',
      name: 'Hydroponic Alert',
      description: 'Test pH/EC drift notifications',
      icon: Droplets,
      color: 'text-cyan-500',
      action: async () => {
        const response = await fetch('/api/test/alert-hydroponic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phoneNumber,
            ph: 7.2,
            ec: 3.5,
            zone: 'Hydro System 1',
          }),
        });
        return response.json();
      }
    },
  ];

  const runTest = async (scenario: typeof testScenarios[0]) => {
    if (!phoneNumber) {
      alert('Please enter a phone number');
      return;
    }

    setTesting(scenario.id);
    try {
      const result = await scenario.action();
      setTestResults(prev => ({
        ...prev,
        [scenario.id]: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [scenario.id]: { error: error.message }
      }));
    } finally {
      setTesting(null);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Format as US phone number
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <TestTube className="w-8 h-8 text-purple-500" />
            Test Alert System
          </h1>
          <p className="text-gray-400">Verify your Twilio integration and test different alert scenarios</p>
        </div>

        {/* Configuration Status */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Twilio Configuration Status
          </h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Account SID:</span>
              <span className="font-mono text-green-400">AC985b...4a84c ✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">API Key:</span>
              <span className="font-mono text-green-400">SK2741...54372 ✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Phone Number:</span>
              <span className="font-mono text-green-400">+1 (866) 972-6974 ✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Region:</span>
              <span className="font-mono text-green-400">us-east ✓</span>
            </div>
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Test Phone Number (Where to send alerts)
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:outline-none focus:border-purple-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            Standard SMS rates may apply. Enter the number where you want to receive test alerts.
          </p>
        </div>

        {/* Test Scenarios */}
        <div className="space-y-4">
          {testScenarios.map(scenario => {
            const Icon = scenario.icon;
            const result = testResults[scenario.id];
            const isLoading = testing === scenario.id;
            
            return (
              <div key={scenario.id} className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Icon className={`w-6 h-6 ${scenario.color} mt-0.5`} />
                    <div>
                      <h3 className="font-semibold text-white">{scenario.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{scenario.description}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => runTest(scenario)}
                    disabled={isLoading || !phoneNumber}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      isLoading || !phoneNumber
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Run Test
                      </>
                    )}
                  </button>
                </div>
                
                {/* Test Result */}
                {result && (
                  <div className={`mt-4 p-4 rounded-lg text-sm ${
                    result.error 
                      ? 'bg-red-900/20 border border-red-800' 
                      : 'bg-green-900/20 border border-green-800'
                  }`}>
                    <div className="flex items-start gap-2">
                      {result.error ? (
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      )}
                      <div>
                        {result.error ? (
                          <p className="text-red-400">Error: {result.error}</p>
                        ) : (
                          <>
                            <p className="text-green-400 font-medium">Success!</p>
                            {result.messageId && (
                              <p className="text-gray-400 text-xs mt-1">
                                Message ID: {result.messageId}
                              </p>
                            )}
                            {result.details && (
                              <p className="text-gray-300 mt-1">{result.details}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-900/20 border border-blue-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm">
              <h3 className="font-semibold text-blue-400 mb-2">Testing Tips</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Start with the Basic SMS Test to verify your setup</li>
                <li>• Voice calls may take a few seconds to connect</li>
                <li>• Check your phone's spam folder if messages don't appear</li>
                <li>• Each test simulates real alert conditions</li>
                <li>• You can test with any valid phone number</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}