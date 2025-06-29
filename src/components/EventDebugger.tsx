"use client"

import { useEffect, useState } from 'react'

export function EventDebugger() {
  const [mounted, setMounted] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  
  // Check mounting
  useEffect(() => {
    setMounted(true)
    
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      
      // Check for React
      
      // Check for hydration
      const checkHydration = () => {
        const root = document.getElementById('__next')
        setHydrated(true)
      }
      
      if (document.readyState === 'complete') {
        checkHydration()
      } else {
        window.addEventListener('load', checkHydration)
      }
      
      // Test basic event
      const testDiv = document.createElement('div')
      testDiv.click()
      
      // Test addEventListener
      document.addEventListener('test-event', testHandler)
      document.dispatchEvent(new Event('test-event'))
      document.removeEventListener('test-event', testHandler)
    }
    
    return () => {
    }
  }, [])
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 999999,
        fontFamily: 'monospace'
      }}
    >
      <div>EventDebugger</div>
      <div>Mounted: {mounted ? 'Yes' : 'No'}</div>
      <div>Hydrated: {hydrated ? 'Yes' : 'No'}</div>
      <div>Time: {new Date().toLocaleTimeString()}</div>
      <button
        onClick={() => {
          alert('EventDebugger button works!')
        }}
        style={{
          marginTop: '5px',
          padding: '5px 10px',
          background: '#4CAF50',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        Test Click
      </button>
    </div>
  )
}