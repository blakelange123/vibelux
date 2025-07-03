'use client';

import { useEffect, useRef, useState } from 'react';

export default function AdvancedDesignerStandalone() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    setStatus('Component mounted');
    
    const canvas = canvasRef.current;
    if (!canvas) {
      setStatus('Canvas ref not found');
      return;
    }
    
    setStatus('Canvas found, getting context...');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setStatus('Could not get 2D context');
      return;
    }
    
    setStatus('Drawing...');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Clear and draw
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Advanced Designer V3 - Standalone', canvas.width / 2, 50);
    
    // Draw grid
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    setStatus('Canvas rendered successfully!');
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw',
      margin: 0,
      padding: 0,
      backgroundColor: '#111'
    }}>
      {/* Left Sidebar */}
      <div style={{ 
        width: '320px', 
        backgroundColor: '#222',
        padding: '20px',
        color: 'white'
      }}>
        <h1>Advanced Designer V3</h1>
        <p>Standalone Version</p>
        <p>Status: {status}</p>
      </div>
      
      {/* Canvas Area */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#333'
      }}>
        <canvas 
          ref={canvasRef}
          style={{ 
            border: '2px solid #666',
            display: 'block'
          }}
        />
      </div>
    </div>
  );
}