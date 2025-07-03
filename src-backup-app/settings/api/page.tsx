"use client"

import Link from 'next/link'
import { ArrowLeft, Key, Webhook, Shield, Activity } from 'lucide-react'

export default function APISettingsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/settings" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-white">API Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* API Keys */}
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">API Keys</h2>
            </div>
            <p className="text-gray-400 mb-6">Manage your API keys for integrations</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">Production API Key</span>
                  <span className="text-xs text-green-400">Active</span>
                </div>
                <code className="text-sm text-gray-400">vblx_live_sk_••••••••••••••••</code>
              </div>
              
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">Test API Key</span>
                  <span className="text-xs text-yellow-400">Test Mode</span>
                </div>
                <code className="text-sm text-gray-400">vblx_test_sk_••••••••••••••••</code>
              </div>
            </div>
          </div>

          {/* Webhooks */}
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Webhook className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Webhooks</h2>
            </div>
            <p className="text-gray-400 mb-6">Configure webhook endpoints for real-time events</p>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add Webhook Endpoint
            </button>
          </div>

          {/* Rate Limits */}
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Rate Limits</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">850/1000</p>
                <p className="text-sm text-gray-400">Requests Today</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">100/sec</p>
                <p className="text-sm text-gray-400">Rate Limit</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-sm text-gray-400">Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}