'use client';

import { useEffect, useState } from 'react';

export default function DebugJSPage() {
  const [mounted, setMounted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    addLog('Component mounted');
    
    // Check if we're in browser
    if (typeof window !== 'undefined') {
      addLog('Window object available');
      
      // Log React version
      const React = require('react');
      addLog(`React version: ${React.version}`);
      
      // Check for hydration errors
      const originalError = console.error;
      console.error = (...args) => {
        addLog(`Console error: ${args.join(' ')}`);
        originalError(...args);
      };
      
      return () => {
        console.error = originalError;
      };
    }
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleClick = () => {
    addLog(`Button clicked! Count: ${clickCount + 1}`);
    setClickCount(count => count + 1);
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      minHeight: '100vh'
    }}>
      <h1>JavaScript Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Status:</h2>
        <p>Mounted: {mounted ? '✅ Yes' : '❌ No'}</p>
        <p>Click Count: {clickCount}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleClick}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Click (Count: {clickCount})
        </button>

        <button
          onClick={() => {
            addLog('Testing inline onClick');
            alert('Inline onClick works!');
          }}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Inline Handler
        </button>
      </div>

      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '20px',
        borderRadius: '5px',
        marginTop: '20px',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        <h3>Logs:</h3>
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '5px' }}>{log}</div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>If you see "Mounted: ✅ Yes", React hydration worked</li>
          <li>Click the buttons - they should update the count and show alerts</li>
          <li>Check the logs above for any errors</li>
          <li>Open browser DevTools (F12) and check the Console tab</li>
        </ol>
      </div>

      {/* Test different event binding methods */}
      <div style={{ marginTop: '20px' }}>
        <h3>Event Binding Tests:</h3>
        <button
          {...{onClick: () => addLog('Spread props onClick works')}}
          style={{
            padding: '5px 10px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Spread Props
        </button>
        
        <button
          onMouseDown={() => addLog('onMouseDown works')}
          style={{
            padding: '5px 10px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Mouse Down
        </button>
        
        <button
          onPointerDown={() => addLog('onPointerDown works')}
          style={{
            padding: '5px 10px',
            cursor: 'pointer'
          }}
        >
          Pointer Down
        </button>
      </div>
    </div>
  );
}