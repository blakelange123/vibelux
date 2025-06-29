'use client';

import React, { useEffect, useRef } from 'react';

export function CanvasTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Force canvas size
    canvas.width = 800;
    canvas.height = 600;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some shapes to test
    ctx.fillStyle = 'blue';
    ctx.fillRect(50, 50, 100, 100);

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(400, 300, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Canvas is working!', 250, 100);
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>Canvas Test</h1>
      <canvas 
        ref={canvasRef}
        style={{ 
          border: '2px solid black',
          display: 'block',
          backgroundColor: 'yellow' // This should be overridden by canvas drawing
        }}
      />
      <p>You should see a white canvas with a blue square, red circle, and text above.</p>
    </div>
  );
}

export default CanvasTest;