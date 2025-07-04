"use client"

import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'

export function DebugAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    
    // Test if events work at all
    window.addEventListener('click', testHandler)
    
    return () => {
      window.removeEventListener('click', testHandler)
    }
  }, [])
  
  const handleClick = () => {
    setClickCount(prev => prev + 1)
    setIsOpen(prev => !prev)
  }
  
  if (!mounted) {
    return null // Prevent SSR issues
  }
  
  return (
    <>
      {/* Debug info */}
      <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs" style={{ zIndex: 999999 }}>
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <p>Mounted: {mounted ? 'Yes' : 'No'}</p>
        <p>Click Count: {clickCount}</p>
        <p>Is Open: {isOpen ? 'Yes' : 'No'}</p>
        <p>Time: {new Date().toLocaleTimeString()}</p>
      </div>
      
      {/* Floating Button */}
      <button
        onClick={handleClick}
        className="fixed bottom-24 right-6 p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all duration-300"
        style={{ 
          zIndex: 999999, 
          position: 'fixed', 
          display: 'block',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'manipulation'
        }}
        aria-label="Debug AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
      
      {/* Simple Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-44 right-6 w-80 h-96 bg-gray-900 rounded-lg shadow-2xl p-4"
          style={{ zIndex: 999999 }}
        >
          <h3 className="text-white font-bold mb-4">Debug AI Panel</h3>
          <p className="text-gray-300">The button was clicked {clickCount} times</p>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Close
          </button>
        </div>
      )}
    </>
  )
}