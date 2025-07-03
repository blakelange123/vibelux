'use client'

import { useState } from 'react'
import { AIAssistant } from '@/components/AIAssistant'
import { Sparkles, ArrowRight, Lightbulb, Zap, Target, DollarSign } from 'lucide-react'

export default function DemoAIDesignPage() {
  const [showDemo, setShowDemo] = useState(false)

  const examples = [
    {
      icon: <Lightbulb className="w-6 h-6 text-yellow-400" />,
      query: "Design a 4x8 rack with 200 PPFD for lettuce",
      description: "Perfect for leafy greens and herbs"
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      query: "Create a lighting plan for a 10x20 room with 600 PPFD for cannabis",
      description: "Commercial flowering room setup"
    },
    {
      icon: <Target className="w-6 h-6 text-green-400" />,
      query: "Layout for 5x5 tent with 400 PPFD for tomatoes",
      description: "Home growing optimization"
    },
    {
      icon: <DollarSign className="w-6 h-6 text-blue-400" />,
      query: "Design an energy-efficient 8x12 room for herbs",
      description: "Focus on ROI and efficiency"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-10 h-10 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-Powered Lighting Design
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Describe your grow space in natural language and watch as our AI instantly generates 
            a professional lighting layout on the design canvas.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-purple-400 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Fixture Selection</h3>
            <p className="text-gray-400">
              AI selects optimal fixtures from our 1200+ DLC database based on your requirements
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-green-400 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Optimal Layout</h3>
            <p className="text-gray-400">
              Automatically calculates ideal fixture placement for maximum uniformity
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-blue-400 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Energy Analysis</h3>
            <p className="text-gray-400">
              Instant calculations for power usage, DLI, and monthly operating costs
            </p>
          </div>
        </div>

        {/* Example Queries */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-12">
          <h2 className="text-2xl font-semibold mb-6">Try These Example Queries:</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {examples.map((example, index) => (
              <div 
                key={index}
                className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors cursor-pointer group"
                onClick={() => {
                  // Open AI Assistant and insert query
                  window.dispatchEvent(new CustomEvent('openAIAssistant'))
                  setTimeout(() => {
                    const input = document.querySelector('input[placeholder="Describe your grow space..."]') as HTMLInputElement
                    if (input) {
                      input.value = example.query
                      input.dispatchEvent(new Event('input', { bubbles: true }))
                    }
                  }, 500)
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{example.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-white group-hover:text-purple-400 transition-colors">
                      "{example.query}"
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{example.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 mt-1 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-600">
                <span className="text-2xl font-bold text-purple-400">1</span>
              </div>
              <h3 className="font-semibold mb-2">Describe Your Space</h3>
              <p className="text-gray-400 text-sm">
                Tell the AI about your room size, crop type, and lighting goals
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-600">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Generates Design</h3>
              <p className="text-gray-400 text-sm">
                Our AI calculates optimal fixture placement and specifications
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-600">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="font-semibold mb-2">Apply to Canvas</h3>
              <p className="text-gray-400 text-sm">
                Click one button to see your design visualized and ready to edit
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openAIAssistant'))
            }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            <Sparkles className="w-6 h-6" />
            Try AI Design Assistant Now
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-gray-500 text-sm mt-4">
            No credit card required • 5 free AI designs per month
          </p>
        </div>
      </div>

      {/* AI Assistant Component */}
      <AIAssistant />
    </div>
  )
}