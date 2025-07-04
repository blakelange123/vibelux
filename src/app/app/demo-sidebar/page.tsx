"use client"

import { CustomizableSidebarSystem, DEFAULT_SIDEBAR_ITEMS } from '@/components/CustomizableSidebarSystem'
import { useState } from 'react'

export default function DemoSidebarPage() {
  const [config, setConfig] = useState<any[]>([])

  return (
    <div className="h-screen bg-gray-950">
      <CustomizableSidebarSystem
        availableItems={DEFAULT_SIDEBAR_ITEMS}
        onConfigChange={setConfig}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gray-900 border-b border-gray-800 p-4">
            <h1 className="text-2xl font-bold text-white">Customizable Sidebar Demo</h1>
            <p className="text-gray-400 mt-1">Click "Customize" to add, remove, and rearrange sidebars</p>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Add multiple sidebars on left, right, or as floating panels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Drag and drop items between sidebars</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Collapse/expand sidebars to save space</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Persistent configuration saved to localStorage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Reset to default configuration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Floating panels can be positioned anywhere</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Instructions</h2>
                <ol className="space-y-2 text-gray-300 list-decimal list-inside">
                  <li>Click the "Customize" button at the top</li>
                  <li>Use "+ Left", "+ Right", or "+ Floating" to add new sidebars</li>
                  <li>Drag items from the bottom palette to any sidebar</li>
                  <li>Click the X button on sidebars to remove them</li>
                  <li>Click "Done" when finished customizing</li>
                  <li>Your configuration is automatically saved</li>
                </ol>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Current Configuration</h2>
                <pre className="bg-gray-900 p-4 rounded overflow-x-auto">
                  <code className="text-gray-300 text-sm">
                    {JSON.stringify(config, null, 2)}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </CustomizableSidebarSystem>
    </div>
  )
}