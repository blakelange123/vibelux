"use client"

import { useState } from 'react'
import { Sparkles, Info, Check, AlertCircle, ExternalLink } from 'lucide-react'

export function AIAssistantSettings() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">AI Assistant Information</h2>
        <p className="text-gray-400">Learn about the Vibelux AI Assistant capabilities</p>
      </div>

      {/* AI Capabilities */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Lighting Expert</h3>
            <p className="text-gray-400 mb-4">
              Our AI Assistant uses Claude 3.5 to provide expert lighting design recommendations tailored to your specific needs.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">What it can do:</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Design custom lighting plans for any room size</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Calculate PPFD, DLI, and energy requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Recommend fixtures from 1200+ DLC database</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Optimize spectrum for specific crops</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Provide ROI and energy efficiency analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Design multi-tier and vertical farming systems</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Supported crops:</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">🥬</span>
                <span>Leafy greens (lettuce, spinach, kale)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">🌿</span>
                <span>Herbs (basil, cilantro, parsley)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">🍅</span>
                <span>Tomatoes and fruiting vegetables</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">🌸</span>
                <span>Cannabis and hemp</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">🍓</span>
                <span>Strawberries and berries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">🌻</span>
                <span>Ornamental flowers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Limits */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Query Limits</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <h4 className="text-2xl font-bold text-purple-400 mb-1">5</h4>
            <p className="text-sm text-gray-400">Free Trial</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <h4 className="text-2xl font-bold text-purple-400 mb-1">25</h4>
            <p className="text-sm text-gray-400">Starter Plan</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <h4 className="text-2xl font-bold text-purple-400 mb-1">100</h4>
            <p className="text-sm text-gray-400">Professional</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <h4 className="text-2xl font-bold text-purple-400 mb-1">500</h4>
            <p className="text-sm text-gray-400">Business</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 text-center">
            <h4 className="text-2xl font-bold text-purple-400 mb-1">∞</h4>
            <p className="text-sm text-gray-400">Enterprise</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800/30 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Tips for best results:</h4>
            <ul className="text-sm text-blue-200/80 space-y-1">
              <li>• Be specific about your room dimensions and crop type</li>
              <li>• Mention your growth stage (seedling, vegetative, flowering)</li>
              <li>• Include any environmental constraints (temperature, humidity)</li>
              <li>• Ask about energy costs if ROI is important</li>
              <li>• Request spectrum recommendations for quality optimization</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-300 mb-1">Privacy & Security</h4>
            <p className="text-sm text-gray-400">
              All AI conversations are processed securely through our servers. We do not store your conversations or use them for training. 
              API calls are made server-side to protect your data and our infrastructure.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-800/30">
        <h3 className="text-lg font-semibold text-white mb-2">Need more AI queries?</h3>
        <p className="text-gray-300 mb-4">
          Upgrade your plan to get more monthly AI queries and unlock advanced features like API access, 
          team collaboration, and priority support.
        </p>
        <a
          href="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          View Pricing Plans
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}