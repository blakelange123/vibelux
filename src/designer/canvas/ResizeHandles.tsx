'use client';

import React, { useEffect, useRef } from 'react';

interface ResizeHandlesProps {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  onResize: (handle: string, dx: number, dy: number) => void;
  onResizeStart: (handle: string) => void;
  onResizeEnd: () => void;
}

export function ResizeHandles({
  x,
  y,
  width,
  height,
  scale,
  offsetX,
  offsetY,
  onResize,
  onResizeStart,
  onResizeEnd
}: ResizeHandlesProps) {
  const [hoveredHandle, setHoveredHandle] = React.useState<string | null>(null);
  const [activeHandle, setActiveHandle] = React.useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleSize = 12; // Increased from 8 for better visibility
  const handles = [
    { id: 'nw', x: x - width/2, y: y - height/2, cursor: 'nw-resize' },
    { id: 'n', x: x, y: y - height/2, cursor: 'n-resize' },
    { id: 'ne', x: x + width/2, y: y - height/2, cursor: 'ne-resize' },
    { id: 'e', x: x + width/2, y: y, cursor: 'e-resize' },
    { id: 'se', x: x + width/2, y: y + height/2, cursor: 'se-resize' },
    { id: 's', x: x, y: y + height/2, cursor: 's-resize' },
    { id: 'sw', x: x - width/2, y: y + height/2, cursor: 'sw-resize' },
    { id: 'w', x: x - width/2, y: y, cursor: 'w-resize' },
  ];

  
  // Global mouse move and up handlers
  useEffect(() => {
    if (!activeHandle || !dragStartRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      
      const dx = (e.clientX - dragStartRef.current.x) / scale;
      const dy = (e.clientY - dragStartRef.current.y) / scale;
      
      onResize(activeHandle, dx, dy);
    };
    
    const handleMouseUp = () => {
      setActiveHandle(null);
      dragStartRef.current = null;
      onResizeEnd();
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeHandle, scale, onResize, onResizeEnd]);
  
  return (
    <>
      {/* Debug: Show bounding box */}
      <div
        className="absolute border-2 border-blue-400 pointer-events-none"
        style={{
          left: offsetX + (x - width/2) * scale,
          top: offsetY + (y - height/2) * scale,
          width: width * scale,
          height: height * scale,
          zIndex: 999
        }}
      />
      {handles.map(handle => (
        <div
          key={handle.id}
          className="absolute transition-all shadow-md"
          style={{
            left: offsetX + handle.x * scale - handleSize / 2,
            top: offsetY + handle.y * scale - handleSize / 2,
            width: handleSize,
            height: handleSize,
            cursor: handle.cursor,
            zIndex: 10000,
            position: 'absolute',
            pointerEvents: 'auto',
            backgroundColor: hoveredHandle === handle.id ? '#8b5cf6' : 'white',
            border: '2px solid #8b5cf6',
            borderRadius: '2px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transform: hoveredHandle === handle.id ? 'scale(1.25)' : 'scale(1)'
          }}
          onMouseEnter={() => setHoveredHandle(handle.id)}
          onMouseLeave={() => setHoveredHandle(null)}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Set active handle and start position
            setActiveHandle(handle.id);
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            
            // Call the resize start callback
            onResizeStart(handle.id);
            
          }}
        />
      ))}
    </>
  );
}