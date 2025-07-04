'use client';

import React, { useRef, useEffect, useState } from 'react';

interface Designer2Point5DProps {
  objects: any[];
  roomDimensions: { width: number; length: number; height: number };
  onObjectSelect: (id: string | null) => void;
  selectedObject: string | null;
  showPPFD: boolean;
  showGrid: boolean;
  showFalseColorMap: boolean;
}

export function Designer2Point5D({
  objects,
  roomDimensions,
  onObjectSelect,
  selectedObject,
  showPPFD,
  showGrid,
  showFalseColorMap
}: Designer2Point5DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: -30, y: 45 }); // Isometric view
  const [zoom, setZoom] = useState(20);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Convert 3D coordinates to 2D isometric projection
  const project3D = (x: number, y: number, z: number) => {
    const scale = zoom;
    const radX = rotation.x * Math.PI / 180;
    const radY = rotation.y * Math.PI / 180;
    
    // Rotate around Y axis (horizontal rotation)
    const x1 = x * Math.cos(radY) - z * Math.sin(radY);
    const z1 = x * Math.sin(radY) + z * Math.cos(radY);
    
    // Rotate around X axis (vertical rotation)
    const y1 = y * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);
    
    // Project to 2D
    const screenX = x1 * scale + window.innerWidth / 2 + pan.x;
    const screenY = -y1 * scale + window.innerHeight / 2 + pan.y;
    
    return { x: screenX, y: screenY, depth: z2 };
  };

  // Draw the scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sort objects by depth for proper rendering order
    const sortedObjects = [...objects].sort((a, b) => {
      const depthA = project3D(a.x, a.y, a.z).depth;
      const depthB = project3D(b.x, b.y, b.z).depth;
      return depthB - depthA;
    });

    // Draw room
    const drawRoom = () => {
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;

      // Floor
      const corners = [
        project3D(0, 0, 0),
        project3D(roomDimensions.width, 0, 0),
        project3D(roomDimensions.width, roomDimensions.length, 0),
        project3D(0, roomDimensions.length, 0)
      ];

      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      corners.forEach(corner => ctx.lineTo(corner.x, corner.y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Walls
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      
      // Back wall
      const backWall = [
        project3D(0, 0, 0),
        project3D(roomDimensions.width, 0, 0),
        project3D(roomDimensions.width, 0, roomDimensions.height),
        project3D(0, 0, roomDimensions.height)
      ];
      
      ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
      ctx.beginPath();
      ctx.moveTo(backWall[0].x, backWall[0].y);
      backWall.forEach(corner => ctx.lineTo(corner.x, corner.y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Grid
      if (showGrid) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        
        // X lines
        for (let x = 0; x <= roomDimensions.width; x += 1) {
          const start = project3D(x, 0, 0);
          const end = project3D(x, roomDimensions.length, 0);
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
        
        // Y lines
        for (let y = 0; y <= roomDimensions.length; y += 1) {
          const start = project3D(0, y, 0);
          const end = project3D(roomDimensions.width, y, 0);
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
      }
    };

    // Draw objects
    const drawObject = (obj: any) => {
      const pos = project3D(obj.x, obj.y, obj.z);
      
      ctx.save();
      
      if (obj.type === 'fixture') {
        // Draw fixture box
        const w = obj.width * zoom;
        const h = obj.length * zoom;
        const depth = obj.height * zoom;
        
        // Top face
        ctx.fillStyle = obj.enabled ? '#ffd700' : '#666';
        ctx.strokeStyle = selectedObject === obj.id ? '#ff6b35' : '#333';
        ctx.lineWidth = selectedObject === obj.id ? 3 : 1;
        
        const top = [
          project3D(obj.x - obj.width/2, obj.y - obj.length/2, obj.z),
          project3D(obj.x + obj.width/2, obj.y - obj.length/2, obj.z),
          project3D(obj.x + obj.width/2, obj.y + obj.length/2, obj.z),
          project3D(obj.x - obj.width/2, obj.y + obj.length/2, obj.z)
        ];
        
        ctx.beginPath();
        ctx.moveTo(top[0].x, top[0].y);
        top.forEach(corner => ctx.lineTo(corner.x, corner.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Light cone
        if (showPPFD && obj.enabled) {
          const beamAngle = obj.model?.beamAngle || 120;
          const coneRadius = Math.tan(beamAngle * Math.PI / 360) * obj.z;
          
          ctx.fillStyle = 'rgba(255, 255, 100, 0.1)';
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          
          const bottomCenter = project3D(obj.x, obj.y, 0);
          const bottomLeft = project3D(obj.x - coneRadius, obj.y - coneRadius, 0);
          const bottomRight = project3D(obj.x + coneRadius, obj.y + coneRadius, 0);
          
          ctx.lineTo(bottomLeft.x, bottomLeft.y);
          ctx.lineTo(bottomRight.x, bottomRight.y);
          ctx.closePath();
          ctx.fill();
        }
        
        // Label
        ctx.fillStyle = 'white';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${obj.model?.wattage || 0}W`, pos.x, pos.y - 10);
      }
      else if (obj.type === 'bench') {
        // Draw bench
        const top = [
          project3D(obj.x - obj.width/2, obj.y - obj.length/2, obj.z + obj.height),
          project3D(obj.x + obj.width/2, obj.y - obj.length/2, obj.z + obj.height),
          project3D(obj.x + obj.width/2, obj.y + obj.length/2, obj.z + obj.height),
          project3D(obj.x - obj.width/2, obj.y + obj.length/2, obj.z + obj.height)
        ];
        
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = selectedObject === obj.id ? '#ff6b35' : '#333';
        ctx.lineWidth = selectedObject === obj.id ? 3 : 1;
        
        ctx.beginPath();
        ctx.moveTo(top[0].x, top[0].y);
        top.forEach(corner => ctx.lineTo(corner.x, corner.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      
      ctx.restore();
    };

    // Draw everything
    drawRoom();
    sortedObjects.forEach(obj => drawObject(obj));
    
    // Info text
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('2.5D View - Use mouse to rotate, scroll to zoom', 10, 20);
    ctx.fillText(`Rotation: X=${rotation.x.toFixed(0)}° Y=${rotation.y.toFixed(0)}°`, 10, 40);
    ctx.fillText(`Zoom: ${zoom.toFixed(0)}`, 10, 60);

  }, [objects, roomDimensions, selectedObject, rotation, zoom, pan, showGrid, showPPFD]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - rotation.y, y: e.clientY - rotation.x });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setRotation({
        x: Math.max(-90, Math.min(0, e.clientY - dragStart.y)),
        y: e.clientX - dragStart.x
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = zoom - e.deltaY * 0.05;
    setZoom(Math.max(5, Math.min(50, newZoom)));
  };

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on an object
    for (const obj of objects) {
      const pos = project3D(obj.x, obj.y, obj.z);
      const size = zoom * Math.max(obj.width, obj.length);
      
      if (Math.abs(x - pos.x) < size/2 && Math.abs(y - pos.y) < size/2) {
        onObjectSelect(obj.id);
        return;
      }
    }
    
    onObjectSelect(null);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 cursor-move"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
    />
  );
}